import { and, desc, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseEntityLogsTable } from './schema';

export type CaseEntityLog = typeof caseEntityLogsTable.$inferSelect;

export type CaseEntityLogData = Omit<CaseEntityLog, 'caseId' | 'createdAt'>;

export class CaseEntityLogRepo extends BaseCaseRepo<CaseEntityLog> {
  protected table() {
    return caseEntityLogsTable;
  }

  async getById(createdAt: number): Promise<CaseEntityLog> {
    const records = await this.db
      .select()
      .from(caseEntityLogsTable)
      .where(and(eq(caseEntityLogsTable.caseId, this.caseId), eq(caseEntityLogsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case entity log not found');
    }
    return records[0];
  }

  async getLast(): Promise<CaseEntityLog> {
    const records = await this.db
      .select()
      .from(caseEntityLogsTable)
      .where(eq(caseEntityLogsTable.caseId, this.caseId))
      .orderBy(desc(caseEntityLogsTable.createdAt))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case entity log not found');
    }
    return records[0];
  }

  async create(data: CaseEntityLogData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseEntityLogsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseEntityLogsTable)
      .where(and(eq(caseEntityLogsTable.caseId, this.caseId), eq(caseEntityLogsTable.createdAt, createdAt)));
  }
}
