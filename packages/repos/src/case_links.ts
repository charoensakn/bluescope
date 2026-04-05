import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseLinksTable } from './schema';

export type CaseLink = typeof caseLinksTable.$inferSelect;

export type CaseLinkData = Omit<CaseLink, 'caseId' | 'sourceId' | 'targetId' | 'createdAt'>;

export class CaseLinkRepo extends BaseCaseRepo<CaseLink> {
  protected table() {
    return caseLinksTable;
  }

  async getById(createdAt: number, sourceId: string, targetId: string): Promise<CaseLink> {
    const records = await this.db
      .select()
      .from(caseLinksTable)
      .where(
        and(
          eq(caseLinksTable.caseId, this.caseId),
          eq(caseLinksTable.createdAt, createdAt),
          eq(caseLinksTable.sourceId, sourceId),
          eq(caseLinksTable.targetId, targetId),
        ),
      )
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case link not found');
    }
    return records[0];
  }

  async create(sourceId: string, targetId: string, data: CaseLinkData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseLinksTable).values({ ...data, caseId: this.caseId, sourceId, targetId, createdAt });
    return this.getById(createdAt, sourceId, targetId);
  }

  async update(createdAt: number, sourceId: string, targetId: string, data: CaseLinkData): Promise<CaseLink> {
    await this.db
      .update(caseLinksTable)
      .set(data)
      .where(
        and(
          eq(caseLinksTable.caseId, this.caseId),
          eq(caseLinksTable.createdAt, createdAt),
          eq(caseLinksTable.sourceId, sourceId),
          eq(caseLinksTable.targetId, targetId),
        ),
      );
    return this.getById(createdAt, sourceId, targetId);
  }

  async delete(createdAt: number, sourceId: string, targetId: string): Promise<void> {
    await this.db
      .delete(caseLinksTable)
      .where(
        and(
          eq(caseLinksTable.caseId, this.caseId),
          eq(caseLinksTable.createdAt, createdAt),
          eq(caseLinksTable.sourceId, sourceId),
          eq(caseLinksTable.targetId, targetId),
        ),
      );
  }
}
