import { desc, eq, isNull } from 'drizzle-orm';
import { BaseRepo } from './base';
import { casesTable } from './schema';

export type Case = typeof casesTable.$inferSelect;

export type CaseData = Partial<Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;

export class CaseRepo extends BaseRepo {
  async getAll(deleted?: boolean): Promise<Case[]> {
    if (deleted) {
      return this.db.select().from(casesTable).orderBy(desc(casesTable.updatedAt));
    }
    return this.db.select().from(casesTable).where(isNull(casesTable.deletedAt)).orderBy(desc(casesTable.updatedAt));
  }

  async getById(id: string): Promise<Case> {
    const records = await this.db.select().from(casesTable).where(eq(casesTable.id, id)).limit(1);
    if (records.length === 0) {
      throw new Error('Case not found');
    }
    return records[0];
  }

  async create(data: CaseData): Promise<Case> {
    const id = this.generateId();
    const timestamp = Date.now();
    await this.db.insert(casesTable).values({ id, ...data, createdAt: timestamp, updatedAt: timestamp });
    return this.getById(id);
  }

  async update(id: string, data: CaseData): Promise<Case> {
    const updatedAt = Date.now();
    await this.db
      .update(casesTable)
      .set({ ...data, updatedAt })
      .where(eq(casesTable.id, id));
    return this.getById(id);
  }

  async delete(id: string, permanent?: boolean): Promise<void> {
    if (permanent) {
      await this.db.delete(casesTable).where(eq(casesTable.id, id));
    } else {
      const now = Date.now();
      await this.db.update(casesTable).set({ deletedAt: now, updatedAt: now }).where(eq(casesTable.id, id));
    }
  }

  async undelete(id: string): Promise<void> {
    const now = Date.now();
    await this.db.update(casesTable).set({ deletedAt: null, updatedAt: now }).where(eq(casesTable.id, id));
  }
}
