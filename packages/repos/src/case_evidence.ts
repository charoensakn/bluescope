import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseEvidenceTable } from './schema';

export type CaseEvidence = typeof caseEvidenceTable.$inferSelect;

export type CaseEvidenceData = Omit<CaseEvidence, 'caseId' | 'createdAt'>;

export class CaseEvidenceRepo extends BaseCaseRepo<CaseEvidence> {
  protected table() {
    return caseEvidenceTable;
  }

  async getById(createdAt: number): Promise<CaseEvidence> {
    const records = await this.db
      .select()
      .from(caseEvidenceTable)
      .where(and(eq(caseEvidenceTable.caseId, this.caseId), eq(caseEvidenceTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case evidence not found');
    }
    return records[0];
  }

  async create(data: CaseEvidenceData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseEvidenceTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CaseEvidenceData): Promise<CaseEvidence> {
    await this.db
      .update(caseEvidenceTable)
      .set(data)
      .where(and(eq(caseEvidenceTable.caseId, this.caseId), eq(caseEvidenceTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseEvidenceTable)
      .where(and(eq(caseEvidenceTable.caseId, this.caseId), eq(caseEvidenceTable.createdAt, createdAt)));
  }
}
