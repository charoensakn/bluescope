import { and, count, desc, eq, sum } from 'drizzle-orm';
import { BaseRepo } from './base';
import { usageLogsTable } from './schema';

export type UsageLog = typeof usageLogsTable.$inferSelect;

export type UsageLogData = Partial<Omit<UsageLog, 'createdAt'>>;

export type UsageLogSum = {
  agent: string;
  provider: string;
  model: string;
  sumInput: number;
  sumOutput: number;
  sumTotal: number;
  count: number;
};

export class UsageLogRepo extends BaseRepo {
  async getAll(): Promise<UsageLog[]> {
    return this.db.select().from(usageLogsTable);
  }

  async getById(agentName: string, createdAt: number): Promise<UsageLog> {
    const records = await this.db
      .select()
      .from(usageLogsTable)
      .where(and(eq(usageLogsTable.agentName, agentName), eq(usageLogsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Usage log not found');
    }
    return records[0];
  }

  async create(data: UsageLogData): Promise<UsageLog> {
    const agentName = data.agentName;
    if (!agentName) {
      throw new Error('Agent name is required');
    }
    const createdAt = this.generateTimestamp();
    await this.db.insert(usageLogsTable).values({ ...data, agentName, createdAt });
    return this.getById(agentName, createdAt);
  }

  async delete(agentName: string): Promise<void> {
    await this.db.delete(usageLogsTable).where(eq(usageLogsTable.agentName, agentName));
  }

  async sum(): Promise<UsageLogSum[]> {
    const results = await this.db
      .select({
        agent: usageLogsTable.agentName,
        provider: usageLogsTable.provider,
        model: usageLogsTable.model,
        sumInput: sum(usageLogsTable.input),
        sumOutput: sum(usageLogsTable.output),
        sumTotal: sum(usageLogsTable.total),
        count: count(),
      })
      .from(usageLogsTable)
      .groupBy(usageLogsTable.agentName, usageLogsTable.provider, usageLogsTable.model)
      .orderBy(desc(sum(usageLogsTable.total)));

    return results.map((r) => ({
      agent: r.agent,
      provider: r.provider,
      model: r.model,
      sumInput: parseInt(r.sumInput, 10) || 0,
      sumOutput: parseInt(r.sumOutput, 10) || 0,
      sumTotal: parseInt(r.sumTotal, 10) || 0,
      count: r.count,
    }));
  }
}
