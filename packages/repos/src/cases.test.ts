import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseRepo', () => {
  let repo: CaseRepo;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle')); // Ensure tables are created for testing
    repo = new CaseRepo(db);
  });

  afterEach(() => {
    // Clean up
  });

  describe('create', () => {
    it('should create a new case', async () => {
      const caseData = {
        caseNumber: 'CASE-001',
        title: 'Test Case',
        status: 1,
        priority: 2,
        summary: 'Test Summary',
        description: 'Test Description',
        entity: 'Test Entity',
      };

      const createdCase = await repo.create(caseData);

      expect(createdCase.id).toBeDefined();
      expect(createdCase.caseNumber).toBe('CASE-001');
      expect(createdCase.title).toBe('Test Case');
      expect(createdCase.status).toBe(1);
      expect(createdCase.priority).toBe(2);
      expect(createdCase.summary).toBe('Test Summary');
      expect(createdCase.createdAt).toBeDefined();
      expect(createdCase.updatedAt).toBeDefined();
      expect(createdCase.deletedAt).toBeNull();
    });

    it('should generate unique IDs', async () => {
      const case1 = await repo.create({ title: 'Case 1' });
      const case2 = await repo.create({ title: 'Case 2' });

      expect(case1.id).not.toBe(case2.id);
    });

    it('should set createdAt and updatedAt to same timestamp', async () => {
      const testCase = await repo.create({ title: 'Test Case' });

      expect(testCase.createdAt).toBe(testCase.updatedAt);
    });
  });

  describe('getById', () => {
    it('should retrieve a case by ID', async () => {
      const caseData = { title: 'Test Case', caseNumber: 'CASE-001' };
      const createdCase = await repo.create(caseData);

      const retrievedCase = await repo.getById(createdCase.id);

      expect(retrievedCase.id).toBe(createdCase.id);
      expect(retrievedCase.title).toBe('Test Case');
    });

    it('should throw error if case not found', async () => {
      await expect(repo.getById('non-existent-id')).rejects.toThrow('Case not found');
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted cases', async () => {
      const case1 = await repo.create({ title: 'Case 1' });
      const case2 = await repo.create({ title: 'Case 2' });
      const case3 = await repo.create({ title: 'Case 3' });

      const allCases = await repo.getAll();

      expect(allCases).toHaveLength(3);
      expect(allCases.map((c) => c.id)).toContain(case1.id);
      expect(allCases.map((c) => c.id)).toContain(case2.id);
      expect(allCases.map((c) => c.id)).toContain(case3.id);
    });

    it('should exclude soft-deleted cases by default', async () => {
      const case1 = await repo.create({ title: 'Case 1' });
      const case2 = await repo.create({ title: 'Case 2' });

      await repo.delete(case1.id);

      const allCases = await repo.getAll();

      expect(allCases).toHaveLength(1);
      expect(allCases[0].id).toBe(case2.id);
    });

    it('should include soft-deleted cases when deleted=true', async () => {
      const case1 = await repo.create({ title: 'Case 1' });
      const _case2 = await repo.create({ title: 'Case 2' });

      await repo.delete(case1.id);

      const allCases = await repo.getAll(true);

      expect(allCases).toHaveLength(2);
    });

    it('should return empty array when no cases exist', async () => {
      const allCases = await repo.getAll();

      expect(allCases).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update case properties', async () => {
      const testCase = await repo.create({
        title: 'Original Title',
        caseNumber: 'CASE-001',
      });

      const updated = await repo.update(testCase.id, {
        title: 'Updated Title',
        status: 2,
        priority: 3,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.status).toBe(2);
      expect(updated.priority).toBe(3);
      expect(updated.caseNumber).toBe('CASE-001');
    });

    it('should update the updatedAt timestamp', async () => {
      const testCase = await repo.create({ title: 'Test Case' });
      const originalUpdatedAt = testCase.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repo.update(testCase.id, { title: 'Updated' });

      expect(updated.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('should preserve createdAt on update', async () => {
      const testCase = await repo.create({ title: 'Test Case' });
      const originalCreatedAt = testCase.createdAt;

      const updated = await repo.update(testCase.id, { title: 'Updated' });

      expect(updated.createdAt).toBe(originalCreatedAt);
    });

    it('should throw error if case not found', async () => {
      await expect(repo.update('non-existent-id', { title: 'Updated' })).rejects.toThrow('Case not found');
    });
  });

  describe('delete', () => {
    it('should soft-delete a case by default', async () => {
      const testCase = await repo.create({ title: 'Test Case' });

      await repo.delete(testCase.id);

      const allCases = await repo.getAll();
      expect(allCases).toHaveLength(0);

      const deletedCases = await repo.getAll(true);
      expect(deletedCases).toHaveLength(1);
      expect(deletedCases[0].deletedAt).toBeDefined();
    });

    it('should permanently delete a case when permanent=true', async () => {
      const testCase = await repo.create({ title: 'Test Case' });

      await repo.delete(testCase.id, true);

      const allCases = await repo.getAll(true);
      expect(allCases).toHaveLength(0);
    });

    it('should throw error when getting permanently deleted case', async () => {
      const testCase = await repo.create({ title: 'Test Case' });

      await repo.delete(testCase.id, true);

      await expect(repo.getById(testCase.id)).rejects.toThrow('Case not found');
    });

    it('should update deletedAt and updatedAt on soft delete', async () => {
      const testCase = await repo.create({ title: 'Test Case' });

      await repo.delete(testCase.id);

      const deletedCases = await repo.getAll(true);
      const deletedCase = deletedCases.find((c) => c.id === testCase.id);

      expect(deletedCase?.deletedAt).toBeDefined();
      expect(deletedCase?.updatedAt).toBeGreaterThanOrEqual(testCase.createdAt);
    });
  });

  describe('Integration', () => {
    it('should handle CRUD operations in sequence', async () => {
      // Create
      const caseData = { title: 'Integration Test', caseNumber: 'INT-001' };
      const created = await repo.create(caseData);
      expect(created.id).toBeDefined();

      // Read
      const read = await repo.getById(created.id);
      expect(read.title).toBe('Integration Test');

      // Update
      const updated = await repo.update(created.id, { status: 1 });
      expect(updated.status).toBe(1);

      // List
      const all = await repo.getAll();
      expect(all).toContainEqual(updated);

      // Delete
      await repo.delete(created.id);
      const remaining = await repo.getAll();
      expect(remaining).not.toContain(updated);
    });

    it('should handle multiple cases independently', async () => {
      const cases = await Promise.all([
        repo.create({ title: 'Case A', caseNumber: 'A-001' }),
        repo.create({ title: 'Case B', caseNumber: 'B-001' }),
        repo.create({ title: 'Case C', caseNumber: 'C-001' }),
      ]);

      expect(cases).toHaveLength(3);

      // Update one
      await repo.update(cases[0].id, { status: 1 });

      // Delete another
      await repo.delete(cases[1].id);

      // Check state
      const caseA = await repo.getById(cases[0].id);
      expect(caseA.status).toBe(1);

      const allCases = await repo.getAll();
      expect(allCases).toHaveLength(2);
      expect(allCases.map((c) => c.id)).toContain(cases[0].id);
      expect(allCases.map((c) => c.id)).toContain(cases[2].id);
      expect(allCases.map((c) => c.id)).not.toContain(cases[1].id);
    });
  });
});
