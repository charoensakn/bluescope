import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connect, migrate } from './test_db';
import { UsageLogRepo } from './usage_logs';

describe('UsageLogRepo', () => {
  let repo: UsageLogRepo;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    repo = new UsageLogRepo(db);
  });

  afterEach(() => {
    // Clean up
  });

  describe('create', () => {
    it('should create a new usage log', async () => {
      const logData = {
        agentName: 'test-agent',
        provider: 'openai',
        model: 'gpt-4',
        input: 100,
        output: 200,
        total: 300,
      };

      const createdLog = await repo.create(logData);

      expect(createdLog.agentName).toBe('test-agent');
      expect(createdLog.provider).toBe('openai');
      expect(createdLog.model).toBe('gpt-4');
      expect(createdLog.input).toBe(100);
      expect(createdLog.output).toBe(200);
      expect(createdLog.total).toBe(300);
      expect(createdLog.createdAt).toBeDefined();
    });

    it('should generate unique timestamps', async () => {
      const log1 = await repo.create({ agentName: 'agent-1' });
      const log2 = await repo.create({ agentName: 'agent-2' });

      expect(log1.createdAt).not.toBe(log2.createdAt);
    });

    it('should throw error if agentName is missing', async () => {
      await expect(repo.create({ provider: 'openai' })).rejects.toThrow('Agent name is required');
    });

    it('should allow partial data', async () => {
      const log = await repo.create({
        agentName: 'minimal-agent',
      });

      expect(log.agentName).toBe('minimal-agent');
      expect(log.provider).toBeNull();
      expect(log.createdAt).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should retrieve a usage log by agentName and createdAt', async () => {
      const createdLog = await repo.create({
        agentName: 'test-agent',
        provider: 'openai',
      });

      const retrieved = await repo.getById('test-agent', createdLog.createdAt);

      expect(retrieved.agentName).toBe('test-agent');
      expect(retrieved.provider).toBe('openai');
      expect(retrieved.createdAt).toBe(createdLog.createdAt);
    });

    it('should throw error if usage log not found', async () => {
      await expect(repo.getById('non-existent-agent', 123456)).rejects.toThrow('Usage log not found');
    });

    it('should differentiate logs by exact timestamp', async () => {
      const log1 = await repo.create({ agentName: 'agent-1' });
      const log2 = await repo.create({ agentName: 'agent-1' });

      expect(log1.createdAt).not.toBe(log2.createdAt);

      const retrieved1 = await repo.getById('agent-1', log1.createdAt);
      const retrieved2 = await repo.getById('agent-1', log2.createdAt);

      expect(retrieved1.createdAt).toBe(log1.createdAt);
      expect(retrieved2.createdAt).toBe(log2.createdAt);
    });
  });

  describe('getAll', () => {
    it('should return all usage logs', async () => {
      const log1 = await repo.create({ agentName: 'agent-1' });
      const log2 = await repo.create({ agentName: 'agent-2' });
      const log3 = await repo.create({ agentName: 'agent-3' });

      const all = await repo.getAll();

      expect(all).toHaveLength(3);
      expect(all).toContainEqual(log1);
      expect(all).toContainEqual(log2);
      expect(all).toContainEqual(log3);
    });

    it('should return empty array when no logs exist', async () => {
      const all = await repo.getAll();

      expect(all).toHaveLength(0);
    });

    it('should return all logs including multiple from same agent', async () => {
      await repo.create({ agentName: 'agent-1', provider: 'openai' });
      await repo.create({ agentName: 'agent-1', provider: 'claude' });
      await repo.create({ agentName: 'agent-2', provider: 'openai' });

      const all = await repo.getAll();

      expect(all).toHaveLength(3);
      expect(all.filter((l) => l.agentName === 'agent-1')).toHaveLength(2);
      expect(all.filter((l) => l.agentName === 'agent-2')).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete all logs for an agent', async () => {
      const _log1 = await repo.create({ agentName: 'agent-1' });
      const _log2 = await repo.create({ agentName: 'agent-1' });
      const _log3 = await repo.create({ agentName: 'agent-2' });

      await repo.delete('agent-1');

      const all = await repo.getAll();

      expect(all).toHaveLength(1);
      expect(all[0].agentName).toBe('agent-2');
    });

    it('should throw error when retrieving deleted agent logs', async () => {
      const log = await repo.create({ agentName: 'agent-1' });

      await repo.delete('agent-1');

      await expect(repo.getById('agent-1', log.createdAt)).rejects.toThrow('Usage log not found');
    });

    it('should only delete logs for the specified agent', async () => {
      await repo.create({ agentName: 'agent-1' });
      await repo.create({ agentName: 'agent-1' });
      await repo.create({ agentName: 'agent-2' });
      await repo.create({ agentName: 'agent-3' });

      await repo.delete('agent-1');

      const all = await repo.getAll();

      expect(all).toHaveLength(2);
      expect(all.map((l) => l.agentName)).toEqual(expect.arrayContaining(['agent-2', 'agent-3']));
    });
  });

  describe('Integration', () => {
    it('should handle typical usage log workflow', async () => {
      // Create logs for different agents
      const log1 = await repo.create({
        agentName: 'search-agent',
        provider: 'openai',
        model: 'gpt-4',
        input: 100,
        output: 150,
        total: 250,
      });

      const log2 = await repo.create({
        agentName: 'translate-agent',
        provider: 'claude',
        model: 'claude-3',
        input: 200,
        output: 300,
        total: 500,
      });

      // Retrieve logs
      const retrievedLog1 = await repo.getById(log1.agentName, log1.createdAt);
      const retrievedLog2 = await repo.getById(log2.agentName, log2.createdAt);

      expect(retrievedLog1.provider).toBe('openai');
      expect(retrievedLog2.provider).toBe('claude');

      // Get all logs
      const all = await repo.getAll();
      expect(all).toHaveLength(2);

      // Delete one agent's logs
      await repo.delete('search-agent');

      // Verify deletion
      const remaining = await repo.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].agentName).toBe('translate-agent');
    });

    it('should track multiple logs from the same agent over time', async () => {
      // Create multiple logs from same agent at different times
      const logs = [];
      for (let i = 0; i < 5; i++) {
        const log = await repo.create({
          agentName: 'analytics-agent',
          input: i * 100,
          output: i * 200,
        });
        logs.push(log);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 2));
      }

      // Verify all logs were created
      const all = await repo.getAll();
      expect(all).toHaveLength(5);

      // Verify we can retrieve each one individually
      for (let i = 0; i < logs.length; i++) {
        const retrieved = await repo.getById(logs[i].agentName, logs[i].createdAt);
        expect(retrieved.input).toBe(i * 100);
        expect(retrieved.output).toBe(i * 200);
      }

      // Delete all logs for the agent
      await repo.delete('analytics-agent');
      const afterDelete = await repo.getAll();
      expect(afterDelete).toHaveLength(0);
    });
  });

  describe('sum', () => {
    it('should return empty array when no logs exist', async () => {
      const result = await repo.sum();

      expect(result).toHaveLength(0);
    });

    it('should return summed totals grouped by agent, provider, and model', async () => {
      await repo.create({
        agentName: 'agent-1',
        provider: 'openai',
        model: 'gpt-4',
        input: 100,
        output: 200,
        total: 300,
      });
      await repo.create({
        agentName: 'agent-1',
        provider: 'openai',
        model: 'gpt-4',
        input: 50,
        output: 100,
        total: 150,
      });

      const result = await repo.sum();

      expect(result).toHaveLength(1);
      expect(result[0].agent).toBe('agent-1');
      expect(result[0].provider).toBe('openai');
      expect(result[0].model).toBe('gpt-4');
      expect(result[0].sumInput).toBe(150);
      expect(result[0].sumOutput).toBe(300);
      expect(result[0].sumTotal).toBe(450);
      expect(result[0].count).toBe(2);
    });

    it('should group separately by agent, provider, and model', async () => {
      await repo.create({
        agentName: 'agent-1',
        provider: 'openai',
        model: 'gpt-4',
        input: 100,
        output: 200,
        total: 300,
      });
      await repo.create({
        agentName: 'agent-1',
        provider: 'claude',
        model: 'claude-3',
        input: 50,
        output: 100,
        total: 150,
      });
      await repo.create({
        agentName: 'agent-2',
        provider: 'openai',
        model: 'gpt-4',
        input: 200,
        output: 400,
        total: 600,
      });

      const result = await repo.sum();

      expect(result).toHaveLength(3);
    });

    it('should order results by sumTotal descending', async () => {
      await repo.create({
        agentName: 'agent-a',
        provider: 'openai',
        model: 'gpt-4',
        input: 10,
        output: 20,
        total: 30,
      });
      await repo.create({
        agentName: 'agent-b',
        provider: 'openai',
        model: 'gpt-4',
        input: 200,
        output: 400,
        total: 600,
      });
      await repo.create({
        agentName: 'agent-c',
        provider: 'openai',
        model: 'gpt-4',
        input: 50,
        output: 100,
        total: 150,
      });

      const result = await repo.sum();

      expect(result[0].agent).toBe('agent-b');
      expect(result[1].agent).toBe('agent-c');
      expect(result[2].agent).toBe('agent-a');
    });

    it('should treat null numeric fields as 0', async () => {
      await repo.create({ agentName: 'agent-1' });

      const result = await repo.sum();

      expect(result).toHaveLength(1);
      expect(result[0].sumInput).toBe(0);
      expect(result[0].sumOutput).toBe(0);
      expect(result[0].sumTotal).toBe(0);
      expect(result[0].count).toBe(1);
    });
  });
});
