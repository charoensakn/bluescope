import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseOrganizationsTable } from './schema';

export type CaseOrganization = typeof caseOrganizationsTable.$inferSelect;

export type CaseOrganizationData = Omit<CaseOrganization, 'caseId' | 'createdAt'>;

export class CaseOrganizationRepo extends BaseCaseRepo<CaseOrganization> {
  protected table() {
    return caseOrganizationsTable;
  }

  async getById(createdAt: number): Promise<CaseOrganization> {
    const records = await this.db
      .select()
      .from(caseOrganizationsTable)
      .where(and(eq(caseOrganizationsTable.caseId, this.caseId), eq(caseOrganizationsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case organization not found');
    }
    return records[0];
  }

  async create(data: CaseOrganizationData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseOrganizationsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CaseOrganizationData): Promise<CaseOrganization> {
    await this.db
      .update(caseOrganizationsTable)
      .set(data)
      .where(and(eq(caseOrganizationsTable.caseId, this.caseId), eq(caseOrganizationsTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseOrganizationsTable)
      .where(and(eq(caseOrganizationsTable.caseId, this.caseId), eq(caseOrganizationsTable.createdAt, createdAt)));
  }
}
