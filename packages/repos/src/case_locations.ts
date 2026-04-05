import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseLocationsTable } from './schema';

export type CaseLocation = typeof caseLocationsTable.$inferSelect;

export type CaseLocationData = Omit<CaseLocation, 'caseId' | 'createdAt'>;

export class CaseLocationRepo extends BaseCaseRepo<CaseLocation> {
  protected table() {
    return caseLocationsTable;
  }

  async getById(createdAt: number): Promise<CaseLocation> {
    const records = await this.db
      .select()
      .from(caseLocationsTable)
      .where(and(eq(caseLocationsTable.caseId, this.caseId), eq(caseLocationsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case location not found');
    }
    return records[0];
  }

  async create(data: CaseLocationData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseLocationsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CaseLocationData): Promise<CaseLocation> {
    await this.db
      .update(caseLocationsTable)
      .set(data)
      .where(and(eq(caseLocationsTable.caseId, this.caseId), eq(caseLocationsTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseLocationsTable)
      .where(and(eq(caseLocationsTable.caseId, this.caseId), eq(caseLocationsTable.createdAt, createdAt)));
  }
}
