import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { casePersonsTable } from './schema';

export type CasePerson = typeof casePersonsTable.$inferSelect;

export type CasePersonData = Omit<CasePerson, 'caseId' | 'createdAt'>;

export class CasePersonRepo extends BaseCaseRepo<CasePerson> {
  protected table() {
    return casePersonsTable;
  }

  async getById(createdAt: number): Promise<CasePerson> {
    const records = await this.db
      .select()
      .from(casePersonsTable)
      .where(and(eq(casePersonsTable.caseId, this.caseId), eq(casePersonsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case person not found');
    }
    return records[0];
  }

  async create(data: CasePersonData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(casePersonsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CasePersonData): Promise<CasePerson> {
    await this.db
      .update(casePersonsTable)
      .set(data)
      .where(and(eq(casePersonsTable.caseId, this.caseId), eq(casePersonsTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(casePersonsTable)
      .where(and(eq(casePersonsTable.caseId, this.caseId), eq(casePersonsTable.createdAt, createdAt)));
  }
}
