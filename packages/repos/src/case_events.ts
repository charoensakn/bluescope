import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseEventsTable } from './schema';

export type CaseEvent = typeof caseEventsTable.$inferSelect;

export type CaseEventData = Omit<CaseEvent, 'caseId' | 'createdAt'>;

export class CaseEventRepo extends BaseCaseRepo<CaseEvent> {
  protected table() {
    return caseEventsTable;
  }

  async getById(createdAt: number): Promise<CaseEvent> {
    const records = await this.db
      .select()
      .from(caseEventsTable)
      .where(and(eq(caseEventsTable.caseId, this.caseId), eq(caseEventsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case event not found');
    }
    return records[0];
  }

  async create(data: CaseEventData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseEventsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CaseEventData): Promise<CaseEvent> {
    await this.db
      .update(caseEventsTable)
      .set(data)
      .where(and(eq(caseEventsTable.caseId, this.caseId), eq(caseEventsTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseEventsTable)
      .where(and(eq(caseEventsTable.caseId, this.caseId), eq(caseEventsTable.createdAt, createdAt)));
  }
}
