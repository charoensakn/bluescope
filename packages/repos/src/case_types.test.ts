import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CaseTypeRepo } from './case_types';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseTypeRepo', () => {
  let caseRepo: CaseRepo;
  let typeRepo: CaseTypeRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    typeRepo = new CaseTypeRepo(db, caseId);
  });

  afterEach(() => {
    // Clean up
  });

  describe('put', () => {
    it('should create a new case type', async () => {
      const typeData = {
        caseType: 'homicide',
        reason: 'Evidence suggests intentional killing',
        confidence: 0.95,
      };

      const created = await typeRepo.put(typeData);

      expect(created.caseId).toBe(caseId);
      expect(created.caseType).toBe('homicide');
      expect(created.reason).toBe('Evidence suggests intentional killing');
      expect(created.confidence).toBe(0.95);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
      expect(created.deletedAt).toBeNull();
    });

    it('should update existing case type with same caseType', async () => {
      const typeData = {
        caseType: 'theft',
        reason: 'Initial assessment',
        confidence: 0.7,
      };

      const created = await typeRepo.put(typeData);
      const originalCreatedAt = created.createdAt;

      // Wait to ensure timestamp change
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await typeRepo.put({
        ...typeData,
        reason: 'Updated assessment',
        confidence: 0.85,
      });

      expect(updated.caseType).toBe('theft');
      expect(updated.reason).toBe('Updated assessment');
      expect(updated.confidence).toBe(0.85);
      expect(updated.createdAt).toBe(originalCreatedAt);
      expect(updated.updatedAt).toBeGreaterThan(originalCreatedAt);
      expect(updated.deletedAt).toBeNull();
    });

    it('should handle multiple different case types', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'fraud',
        confidence: 0.6,
        reason: '',
      });

      const all = await typeRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('getById', () => {
    it('should retrieve a case type by caseType', async () => {
      await typeRepo.put({
        caseType: 'arson',
        reason: 'test',
        confidence: 0.8,
      });

      const retrieved = await typeRepo.getById('arson');

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.caseType).toBe('arson');
      expect(retrieved.confidence).toBe(0.8);
    });

    it('should throw error if case type not found', async () => {
      await expect(typeRepo.getById('non-existent')).rejects.toThrow('Case type not found');
    });

    it('should only retrieve types for the current case', async () => {
      // Create another case with a similar type
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherTypeRepo = new CaseTypeRepo(db, otherCase.id);

      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await otherTypeRepo.put({
        caseType: 'homicide',
        confidence: 0.7,
        reason: '',
      });

      const type1 = await typeRepo.getById('homicide');
      const type2 = await otherTypeRepo.getById('homicide');

      expect(type1.caseId).toBe(caseId);
      expect(type2.caseId).toBe(otherCase.id);
      expect(type1.confidence).toBe(0.9);
      expect(type2.confidence).toBe(0.7);
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted case types', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'fraud',
        confidence: 0.6,
        reason: '',
      });

      const all = await typeRepo.getAll();

      expect(all).toHaveLength(3);
      expect(all.map((t) => t.caseType)).toContain('homicide');
      expect(all.map((t) => t.caseType)).toContain('robbery');
      expect(all.map((t) => t.caseType)).toContain('fraud');
    });

    it('should exclude soft-deleted case types by default', async () => {
      const _type1 = await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });

      await typeRepo.delete('homicide');

      const all = await typeRepo.getAll();

      expect(all).toHaveLength(1);
      expect(all[0].caseType).toBe('robbery');
    });

    it('should include soft-deleted case types when deleted=true', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });

      await typeRepo.delete('homicide');

      const all = await typeRepo.getAll(true);

      expect(all).toHaveLength(2);
    });

    it('should return empty array for case with no types', async () => {
      const all = await typeRepo.getAll();

      expect(all).toHaveLength(0);
    });

    it('should only return types for the current case', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherTypeRepo = new CaseTypeRepo(db, otherCase.id);

      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });
      await otherTypeRepo.put({
        caseType: 'fraud',
        confidence: 0.6,
        reason: '',
      });

      const myTypes = await typeRepo.getAll();
      const otherTypes = await otherTypeRepo.getAll();

      expect(myTypes).toHaveLength(2);
      expect(otherTypes).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should soft-delete a case type by default', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });

      await typeRepo.delete('homicide');

      const all = await typeRepo.getAll();
      expect(all).toHaveLength(0);

      const deleted = await typeRepo.getAll(true);
      expect(deleted).toHaveLength(1);
      expect(deleted[0].deletedAt).toBeDefined();
    });

    it('should permanently delete a case type when permanent=true', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });

      await typeRepo.delete('homicide', true);

      const all = await typeRepo.getAll(true);
      expect(all).toHaveLength(0);
    });

    it('should throw error when retrieving permanently deleted type', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });

      await typeRepo.delete('homicide', true);

      await expect(typeRepo.getById('homicide')).rejects.toThrow('Case type not found');
    });

    it('should restore soft-deleted type via put', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.delete('homicide');

      await expect(typeRepo.getById('homicide')).rejects.toThrow();

      const restored = await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.95,
        reason: '',
      });

      expect(restored.deletedAt).toBeNull();

      const retrieved = await typeRepo.getById('homicide');
      expect(retrieved.confidence).toBe(0.95);
    });
  });

  describe('deleteAll', () => {
    it('should soft-delete all case types for a case', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'fraud',
        confidence: 0.6,
        reason: '',
      });

      await typeRepo.deleteAll();

      const all = await typeRepo.getAll();
      expect(all).toHaveLength(0);

      const deleted = await typeRepo.getAll(true);
      expect(deleted).toHaveLength(3);
    });

    it('should permanently delete all when permanent=true', async () => {
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });

      await typeRepo.deleteAll(true);

      const all = await typeRepo.getAll(true);
      expect(all).toHaveLength(0);
    });

    it('should not affect other cases', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherTypeRepo = new CaseTypeRepo(db, otherCase.id);

      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });
      await otherTypeRepo.put({
        caseType: 'fraud',
        confidence: 0.6,
        reason: '',
      });

      await typeRepo.deleteAll();

      const otherTypes = await otherTypeRepo.getAll();
      expect(otherTypes).toHaveLength(1);
      expect(otherTypes[0].caseType).toBe('fraud');
    });
  });

  describe('undelete', () => {
    it('should restore a soft-deleted case type', async () => {
      await typeRepo.put({ caseType: 'homicide', confidence: 0.9, reason: '' });
      await typeRepo.delete('homicide');

      expect(await typeRepo.getAll()).toHaveLength(0);

      await typeRepo.undelete('homicide');

      const all = await typeRepo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].caseType).toBe('homicide');
      expect(all[0].deletedAt).toBeNull();
    });

    it('should update updatedAt on undelete', async () => {
      await typeRepo.put({ caseType: 'robbery', confidence: 0.7, reason: '' });
      const beforeDelete = await typeRepo.getById('robbery');
      await typeRepo.delete('robbery');

      await new Promise((resolve) => setTimeout(resolve, 2));
      await typeRepo.undelete('robbery');

      const retrieved = await typeRepo.getById('robbery');
      expect(retrieved.updatedAt).toBeGreaterThanOrEqual(beforeDelete.updatedAt);
      expect(retrieved.deletedAt).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should handle complete case type workflow', async () => {
      // Create types
      const _type1 = await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      const _type2 = await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.7,
        reason: '',
      });

      // List all
      let all = await typeRepo.getAll();
      expect(all).toHaveLength(2);

      // Update type
      const updated = await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.95,
        reason: '',
      });
      expect(updated.confidence).toBe(0.95);

      // Delete one
      await typeRepo.delete('homicide');

      all = await typeRepo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].caseType).toBe('robbery');

      // Restore via put
      const restored = await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.92,
        reason: '',
      });
      expect(restored.deletedAt).toBeNull();

      all = await typeRepo.getAll();
      expect(all).toHaveLength(2);
    });

    it('should manage multiple cases independently', async () => {
      const case2 = await caseRepo.create({ title: 'Case 2' });
      const case3 = await caseRepo.create({ title: 'Case 3' });

      const typeRepo2 = new CaseTypeRepo(db, case2.id);
      const typeRepo3 = new CaseTypeRepo(db, case3.id);

      // Add types to each case
      await typeRepo.put({
        caseType: 'homicide',
        confidence: 0.9,
        reason: '',
      });
      await typeRepo.put({
        caseType: 'robbery',
        confidence: 0.8,
        reason: '',
      });

      await typeRepo2.put({
        caseType: 'fraud',
        confidence: 0.7,
        reason: '',
      });
      await typeRepo2.put({
        caseType: 'theft',
        confidence: 0.6,
        reason: '',
      });

      await typeRepo3.put({
        caseType: 'arson',
        confidence: 0.5,
        reason: '',
      });

      // Verify isolation
      expect((await typeRepo.getAll()).map((t) => t.caseType)).not.toContain('fraud');
      expect((await typeRepo2.getAll()).map((t) => t.caseType)).not.toContain('homicide');
      expect(await typeRepo3.getAll()).toHaveLength(1);

      // Delete one case's types
      await typeRepo.deleteAll();

      expect(await typeRepo.getAll()).toHaveLength(0);
      expect(await typeRepo2.getAll()).toHaveLength(2);
      expect(await typeRepo3.getAll()).toHaveLength(1);
    });
  });
});
