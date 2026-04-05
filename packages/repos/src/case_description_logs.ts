import { and, desc, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseDescriptionLogsTable } from './schema';

export type CaseDescriptionLog = typeof caseDescriptionLogsTable.$inferSelect;

export type CaseDescriptionLogData = Omit<CaseDescriptionLog, 'caseId' | 'createdAt'>;

export class CaseDescriptionLogRepo extends BaseCaseRepo<CaseDescriptionLog> {
  protected table() {
    return caseDescriptionLogsTable;
  }

  async getById(createdAt: number): Promise<CaseDescriptionLog> {
    const records = await this.db
      .select()
      .from(caseDescriptionLogsTable)
      .where(and(eq(caseDescriptionLogsTable.caseId, this.caseId), eq(caseDescriptionLogsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case description log not found');
    }
    return records[0];
  }

  async getLast(): Promise<CaseDescriptionLog> {
    const records = await this.db
      .select()
      .from(caseDescriptionLogsTable)
      .where(eq(caseDescriptionLogsTable.caseId, this.caseId))
      .orderBy(desc(caseDescriptionLogsTable.createdAt))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case description log not found');
    }
    return records[0];
  }

  async create(data: CaseDescriptionLogData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseDescriptionLogsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseDescriptionLogsTable)
      .where(and(eq(caseDescriptionLogsTable.caseId, this.caseId), eq(caseDescriptionLogsTable.createdAt, createdAt)));
  }
}
