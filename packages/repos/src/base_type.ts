import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { BaseRepo } from './base';
import type { DB } from './db';

export type CaseTypeSum = {
  caseType: string;
  count: number;
};

export abstract class BaseTypeRepo<T, U extends { caseType: string }> extends BaseRepo {
  constructor(
    db: DB,
    public caseId?: string,
  ) {
    super(db);
  }

  // biome-ignore lint/suspicious/noExplicitAny: this is an abstract method that will be implemented by subclasses to return the appropriate table
  protected abstract table(): any;

  async getAll(deleted?: boolean): Promise<T[]> {
    if (this.caseId) {
      if (deleted) {
        return this.db
          .select()
          .from(this.table())
          .where(eq(this.table().caseId, this.caseId))
          .orderBy(desc(this.table().createdAt));
      }
      return this.db
        .select()
        .from(this.table())
        .where(and(eq(this.table().caseId, this.caseId), isNull(this.table().deletedAt)))
        .orderBy(desc(this.table().createdAt));
    } else {
      if (deleted) {
        return this.db.select().from(this.table()).orderBy(desc(this.table().createdAt));
      }
      return this.db
        .select()
        .from(this.table())
        .where(isNull(this.table().deletedAt))
        .orderBy(desc(this.table().createdAt));
    }
  }

  async getById(caseType: string, deleted?: boolean): Promise<T> {
    if (!this.caseId) {
      throw new Error('caseId is required for getById');
    }
    const records = deleted
      ? await this.db
          .select()
          .from(this.table())
          .where(and(eq(this.table().caseId, this.caseId), eq(this.table().caseType, caseType)))
          .limit(1)
      : await this.db
          .select()
          .from(this.table())
          .where(
            and(
              eq(this.table().caseId, this.caseId),
              eq(this.table().caseType, caseType),
              isNull(this.table().deletedAt),
            ),
          )
          .limit(1);
    if (records.length === 0) {
      throw new Error('Case type not found');
    }
    return records[0];
  }

  async put(data: U): Promise<T> {
    if (!this.caseId) {
      throw new Error('caseId is required for put');
    }
    const now = this.generateTimestamp();
    const existing = await this.db
      .select({ caseType: this.table().caseType })
      .from(this.table())
      .where(and(eq(this.table().caseId, this.caseId), eq(this.table().caseType, data.caseType)))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(this.table())
        .set({ ...data, updatedAt: now, deletedAt: null })
        .where(and(eq(this.table().caseId, this.caseId), eq(this.table().caseType, data.caseType)));
    } else {
      await this.db.insert(this.table()).values({
        ...data,
        caseId: this.caseId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }

    return this.getById(data.caseType);
  }

  async delete(caseType: string, permanent?: boolean): Promise<void> {
    if (!this.caseId) {
      throw new Error('caseId is required for delete');
    }
    if (permanent) {
      await this.db
        .delete(this.table())
        .where(and(eq(this.table().caseId, this.caseId), eq(this.table().caseType, caseType)));
    } else {
      const now = Date.now();
      await this.db
        .update(this.table())
        .set({ deletedAt: now, updatedAt: now })
        .where(and(eq(this.table().caseId, this.caseId), eq(this.table().caseType, caseType)));
    }
  }

  async undelete(caseType: string): Promise<void> {
    if (!this.caseId) {
      throw new Error('caseId is required for undelete');
    }
    const now = Date.now();
    await this.db
      .update(this.table())
      .set({ deletedAt: null, updatedAt: now })
      .where(and(eq(this.table().caseId, this.caseId), eq(this.table().caseType, caseType)));
  }

  async deleteAll(permanent?: boolean): Promise<void> {
    if (!this.caseId) {
      throw new Error('caseId is required for deleteAll');
    }
    if (permanent) {
      await this.db.delete(this.table()).where(eq(this.table().caseId, this.caseId));
    } else {
      const now = Date.now();
      await this.db
        .update(this.table())
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(this.table().caseId, this.caseId));
    }
  }

  sum(): Promise<CaseTypeSum[]> {
    if (this.caseId) {
      return this.db
        .select({
          caseType: this.table().caseType,
          count: count(),
        })
        .from(this.table())
        .where(and(eq(this.table().caseId, this.caseId), isNull(this.table().deletedAt)))
        .groupBy(this.table().caseType);
    } else {
      return this.db
        .select({
          caseType: this.table().caseType,
          count: count(),
        })
        .from(this.table())
        .where(isNull(this.table().deletedAt))
        .groupBy(this.table().caseType);
    }
  }
}
