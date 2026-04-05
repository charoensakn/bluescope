import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CaseSuggestionRepo } from './case_suggestions';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseSuggestionRepo', () => {
  let caseRepo: CaseRepo;
  let suggestionRepo: CaseSuggestionRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    suggestionRepo = new CaseSuggestionRepo(db, caseId);
  });

  afterEach(() => {
    // Clean up
  });

  describe('put', () => {
    it('should create a new case suggestion', async () => {
      const suggestionData = {
        caseType: 'homicide',
        suggestion: 'Consider filing charges under premeditated murder statute',
      };

      const created = await suggestionRepo.put(suggestionData);

      expect(created.caseId).toBe(caseId);
      expect(created.caseType).toBe('homicide');
      expect(created.suggestion).toBe('Consider filing charges under premeditated murder statute');
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
      expect(created.deletedAt).toBeNull();
    });

    it('should update existing suggestion with same caseType', async () => {
      const suggestionData = {
        caseType: 'robbery',
        suggestion: 'Initial suggestion',
      };

      const created = await suggestionRepo.put(suggestionData);
      const originalCreatedAt = created.createdAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await suggestionRepo.put({
        ...suggestionData,
        suggestion: 'Updated suggestion based on new evidence',
      });

      expect(updated.caseType).toBe('robbery');
      expect(updated.suggestion).toBe('Updated suggestion based on new evidence');
      expect(updated.createdAt).toBe(originalCreatedAt);
      expect(updated.updatedAt).toBeGreaterThan(originalCreatedAt);
      expect(updated.deletedAt).toBeNull();
    });

    it('should handle multiple suggestions for different case types', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Robbery suggestion',
      });
      await suggestionRepo.put({
        caseType: 'fraud',
        suggestion: 'Fraud suggestion',
      });

      const all = await suggestionRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('getById', () => {
    it('should retrieve a suggestion by caseType', async () => {
      await suggestionRepo.put({
        caseType: 'arson',
        suggestion: 'Check fire patterns and accelerant evidence',
      });

      const retrieved = await suggestionRepo.getById('arson');

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.caseType).toBe('arson');
      expect(retrieved.suggestion).toBe('Check fire patterns and accelerant evidence');
    });

    it('should throw error if suggestion not found', async () => {
      await expect(suggestionRepo.getById('non-existent')).rejects.toThrow('Case type not found');
    });

    it('should only retrieve suggestions for the current case', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherSuggestionRepo = new CaseSuggestionRepo(db, otherCase.id);

      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion for case 1',
      });
      await otherSuggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion for case 2',
      });

      const suggestion1 = await suggestionRepo.getById('homicide');
      const suggestion2 = await otherSuggestionRepo.getById('homicide');

      expect(suggestion1.caseId).toBe(caseId);
      expect(suggestion2.caseId).toBe(otherCase.id);
      expect(suggestion1.suggestion).toBe('Homicide suggestion for case 1');
      expect(suggestion2.suggestion).toBe('Homicide suggestion for case 2');
    });
  });

  describe('getAll', () => {
    it('should return all non-deleted suggestions', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });
      await suggestionRepo.put({
        caseType: 'fraud',
        suggestion: 'Suggestion 3',
      });

      const all = await suggestionRepo.getAll();

      expect(all).toHaveLength(3);
      expect(all.map((s) => s.caseType)).toContain('homicide');
      expect(all.map((s) => s.caseType)).toContain('robbery');
      expect(all.map((s) => s.caseType)).toContain('fraud');
    });

    it('should exclude soft-deleted suggestions by default', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });

      await suggestionRepo.delete('homicide');

      const all = await suggestionRepo.getAll();

      expect(all).toHaveLength(1);
      expect(all[0].caseType).toBe('robbery');
    });

    it('should include soft-deleted suggestions when deleted=true', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });

      await suggestionRepo.delete('homicide');

      const all = await suggestionRepo.getAll(true);

      expect(all).toHaveLength(2);
    });

    it('should return empty array for case with no suggestions', async () => {
      const all = await suggestionRepo.getAll();

      expect(all).toHaveLength(0);
    });

    it('should only return suggestions for the current case', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherSuggestionRepo = new CaseSuggestionRepo(db, otherCase.id);

      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });
      await otherSuggestionRepo.put({
        caseType: 'fraud',
        suggestion: 'Suggestion 3',
      });

      const mySuggestions = await suggestionRepo.getAll();
      const otherSuggestions = await otherSuggestionRepo.getAll();

      expect(mySuggestions).toHaveLength(2);
      expect(otherSuggestions).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should soft-delete a suggestion by default', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion',
      });

      await suggestionRepo.delete('homicide');

      const all = await suggestionRepo.getAll();
      expect(all).toHaveLength(0);

      const deleted = await suggestionRepo.getAll(true);
      expect(deleted).toHaveLength(1);
      expect(deleted[0].deletedAt).toBeDefined();
    });

    it('should permanently delete a suggestion when permanent=true', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion',
      });

      await suggestionRepo.delete('homicide', true);

      const all = await suggestionRepo.getAll(true);
      expect(all).toHaveLength(0);
    });

    it('should throw error when retrieving permanently deleted suggestion', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion',
      });

      await suggestionRepo.delete('homicide', true);

      await expect(suggestionRepo.getById('homicide')).rejects.toThrow('Case type not found');
    });

    it('should restore soft-deleted suggestion via put', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Old suggestion',
      });
      await suggestionRepo.delete('homicide');

      const restored = await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'New suggestion',
      });

      expect(restored.deletedAt).toBeNull();

      const retrieved = await suggestionRepo.getById('homicide');
      expect(retrieved.suggestion).toBe('New suggestion');
    });
  });

  describe('deleteAll', () => {
    it('should soft-delete all suggestions for a case', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });
      await suggestionRepo.put({
        caseType: 'fraud',
        suggestion: 'Suggestion 3',
      });

      await suggestionRepo.deleteAll();

      const all = await suggestionRepo.getAll();
      expect(all).toHaveLength(0);

      const deleted = await suggestionRepo.getAll(true);
      expect(deleted).toHaveLength(3);
    });

    it('should permanently delete all when permanent=true', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });

      await suggestionRepo.deleteAll(true);

      const all = await suggestionRepo.getAll(true);
      expect(all).toHaveLength(0);
    });

    it('should not affect other cases', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherSuggestionRepo = new CaseSuggestionRepo(db, otherCase.id);

      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Suggestion 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Suggestion 2',
      });
      await otherSuggestionRepo.put({
        caseType: 'fraud',
        suggestion: 'Suggestion 3',
      });

      await suggestionRepo.deleteAll();

      const otherSuggestions = await otherSuggestionRepo.getAll();
      expect(otherSuggestions).toHaveLength(1);
      expect(otherSuggestions[0].caseType).toBe('fraud');
    });
  });

  describe('undelete', () => {
    it('should restore a soft-deleted suggestion', async () => {
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Original suggestion',
      });
      await suggestionRepo.delete('homicide');

      expect(await suggestionRepo.getAll()).toHaveLength(0);

      await suggestionRepo.undelete('homicide');

      const all = await suggestionRepo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].caseType).toBe('homicide');
      expect(all[0].deletedAt).toBeNull();
    });

    it('should update updatedAt on undelete', async () => {
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Some suggestion',
      });
      const beforeDelete = await suggestionRepo.getById('robbery');
      await suggestionRepo.delete('robbery');

      await new Promise((resolve) => setTimeout(resolve, 2));
      await suggestionRepo.undelete('robbery');

      const retrieved = await suggestionRepo.getById('robbery');
      expect(retrieved.updatedAt).toBeGreaterThanOrEqual(beforeDelete.updatedAt);
      expect(retrieved.deletedAt).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should handle complete suggestion workflow', async () => {
      // Create suggestions
      const _suggestion1 = await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Initial homicide suggestion',
      });
      const _suggestion2 = await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Initial robbery suggestion',
      });

      // List all
      let all = await suggestionRepo.getAll();
      expect(all).toHaveLength(2);

      // Update suggestion
      const updated = await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Updated homicide suggestion based on evidence',
      });
      expect(updated.suggestion).toBe('Updated homicide suggestion based on evidence');

      // Delete one
      await suggestionRepo.delete('homicide');

      all = await suggestionRepo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].caseType).toBe('robbery');

      // Restore via put
      const restored = await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Restored homicide suggestion',
      });
      expect(restored.deletedAt).toBeNull();

      all = await suggestionRepo.getAll();
      expect(all).toHaveLength(2);
    });

    it('should manage suggestions across multiple cases', async () => {
      const case2 = await caseRepo.create({ title: 'Case 2' });
      const case3 = await caseRepo.create({ title: 'Case 3' });

      const suggestionRepo2 = new CaseSuggestionRepo(db, case2.id);
      const suggestionRepo3 = new CaseSuggestionRepo(db, case3.id);

      // Add suggestions to each case
      await suggestionRepo.put({
        caseType: 'homicide',
        suggestion: 'Homicide suggestion for case 1',
      });
      await suggestionRepo.put({
        caseType: 'robbery',
        suggestion: 'Robbery suggestion for case 1',
      });

      await suggestionRepo2.put({
        caseType: 'fraud',
        suggestion: 'Fraud suggestion for case 2',
      });
      await suggestionRepo2.put({
        caseType: 'theft',
        suggestion: 'Theft suggestion for case 2',
      });

      await suggestionRepo3.put({
        caseType: 'arson',
        suggestion: 'Arson suggestion for case 3',
      });

      // Verify isolation
      expect((await suggestionRepo.getAll()).map((s) => s.caseType).sort()).toEqual(['homicide', 'robbery']);
      expect((await suggestionRepo2.getAll()).map((s) => s.caseType).sort()).toEqual(['fraud', 'theft']);
      expect((await suggestionRepo3.getAll()).map((s) => s.caseType)).toEqual(['arson']);

      // Verify cross-case updates don't interfere
      await suggestionRepo.delete('homicide');
      expect(await suggestionRepo.getAll()).toHaveLength(1);
      expect(await suggestionRepo2.getAll()).toHaveLength(2);
    });
  });
});
