import { eq } from 'drizzle-orm';
import { BaseRepo } from './base';
import type { DB } from './db_type';

export abstract class BaseCaseRepo<T> extends BaseRepo {
  constructor(
    db: DB,
    public caseId: string,
  ) {
    super(db);
  }

  // biome-ignore lint/suspicious/noExplicitAny: this is an abstract method that will be implemented by subclasses to return the appropriate table
  protected abstract table(): any;

  async getAll(): Promise<T[]> {
    return this.db.select().from(this.table()).where(eq(this.table().caseId, this.caseId));
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(this.table()).where(eq(this.table().caseId, this.caseId));
  }
}
