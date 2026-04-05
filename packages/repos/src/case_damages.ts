import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseDamagesTable } from './schema';

export type CaseDamage = typeof caseDamagesTable.$inferSelect;

export type CaseDamageData = Omit<CaseDamage, 'caseId' | 'createdAt'>;

export class CaseDamageRepo extends BaseCaseRepo<CaseDamage> {
  protected table() {
    return caseDamagesTable;
  }

  async getById(createdAt: number): Promise<CaseDamage> {
    const records = await this.db
      .select()
      .from(caseDamagesTable)
      .where(and(eq(caseDamagesTable.caseId, this.caseId), eq(caseDamagesTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case damage not found');
    }
    return records[0];
  }

  async create(data: CaseDamageData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseDamagesTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CaseDamageData): Promise<CaseDamage> {
    await this.db
      .update(caseDamagesTable)
      .set(data)
      .where(and(eq(caseDamagesTable.caseId, this.caseId), eq(caseDamagesTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseDamagesTable)
      .where(and(eq(caseDamagesTable.caseId, this.caseId), eq(caseDamagesTable.createdAt, createdAt)));
  }
}
