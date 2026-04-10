import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CaseRepo } from './cases';
import { SearchRepo } from './search';
import { connect, migrate } from './test_db';

describe('SearchRepo', () => {
  let repo: SearchRepo;
  let caseRepo: CaseRepo;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    caseRepo = new CaseRepo(db);
    repo = new SearchRepo(db, connect());
  });

  afterEach(() => {
    // Clean up
  });

  describe('search', () => {
    it('should return matching case IDs by title', async () => {
      const c = await caseRepo.create({
        title: 'Robbery at Market Street',
        description: 'A theft occurred',
      });

      const results = await repo.search('Robbery');

      expect(results).toContain(c.id);
    });

    it('should return matching case IDs by description', async () => {
      const c = await caseRepo.create({
        title: 'Case Alpha',
        description: 'Suspect was found with counterfeit bills',
      });

      const results = await repo.search('counterfeit');

      expect(results).toContain(c.id);
    });

    it('should not return non-matching cases', async () => {
      const c = await caseRepo.create({
        title: 'Unrelated Case',
        description: 'Nothing relevant here',
      });

      const results = await repo.search('robbery');

      expect(results).not.toContain(c.id);
    });

    it('should return at most 10 results', async () => {
      for (let i = 0; i < 15; i++) {
        await caseRepo.create({
          title: `Fraud Case ${i}`,
          description: 'Financial fraud',
        });
      }

      const results = await repo.search('Fraud');

      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array when no cases match', async () => {
      await caseRepo.create({
        title: 'Arson',
        description: 'Fire-related offense',
      });

      const results = await repo.search('kidnapping');

      expect(results).toEqual([]);
    });

    it('should return only IDs as strings', async () => {
      await caseRepo.create({
        title: 'Homicide Case',
        description: 'Victim found deceased',
      });

      const results = await repo.search('Homicide');

      expect(results.every((id) => typeof id === 'string')).toBe(true);
    });
  });

  describe('refresh', () => {
    it('should pick up newly created cases after refresh', async () => {
      await repo.search('anything'); // initialize
      const c = await caseRepo.create({
        title: 'New Embezzlement Case',
        description: 'Funds were stolen',
      });

      await repo.refresh();
      const results = await repo.search('Embezzlement');

      expect(results).toContain(c.id);
    });

    it('should be callable multiple times without error', async () => {
      await expect(repo.refresh()).resolves.toBeUndefined();
      await expect(repo.refresh()).resolves.toBeUndefined();
    });
  });
});
