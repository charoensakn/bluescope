import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseLinkRepo } from './case_links';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseLinkRepo', () => {
  let linkRepo: CaseLinkRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    linkRepo = new CaseLinkRepo(db, caseId);
  });

  describe('create', () => {
    it('should create a link between entities', async () => {
      const linkData = {
        relation: 'knows',
        confidence: 0.95,
      };

      const created = await linkRepo.create('person-1', 'person-2', linkData);

      expect(created.caseId).toBe(caseId);
      expect(created.sourceId).toBe('person-1');
      expect(created.targetId).toBe('person-2');
      expect(created.relation).toBe('knows');
      expect(created.confidence).toBe(0.95);
      expect(created.createdAt).toBeDefined();
    });

    it('should create multiple links with different relationships', async () => {
      await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0.9,
      });
      await linkRepo.create('person-1', 'location-1', {
        relation: 'seen at',
        confidence: 0.8,
      });
      await linkRepo.create('person-2', 'asset-1', {
        relation: 'owns',
        confidence: 0.95,
      });

      const all = await linkRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('getById', () => {
    it('should retrieve a link by composite key', async () => {
      const created = await linkRepo.create('person-1', 'person-2', {
        relation: 'suspects',
        confidence: 0,
      });

      const retrieved = await linkRepo.getById(created.createdAt, 'person-1', 'person-2');

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.sourceId).toBe('person-1');
      expect(retrieved.targetId).toBe('person-2');
      expect(retrieved.relation).toBe('suspects');
    });

    it('should throw if link not found', async () => {
      await expect(linkRepo.getById(999999, 'person-1', 'person-2')).rejects.toThrow('Case link not found');
    });

    it('should differentiate between different direction links', async () => {
      const link1 = await linkRepo.create('person-1', 'person-2', {
        relation: 'confronted',
        confidence: 0.9,
      });
      const link2 = await linkRepo.create('person-2', 'person-1', {
        relation: 'was confronted by',
        confidence: 0.9,
      });

      const retrieved1 = await linkRepo.getById(link1.createdAt, 'person-1', 'person-2');
      const retrieved2 = await linkRepo.getById(link2.createdAt, 'person-2', 'person-1');

      expect(retrieved1.relation).toBe('confronted');
      expect(retrieved2.relation).toBe('was confronted by');
    });
  });

  describe('getAll', () => {
    it('should return all links for the case', async () => {
      await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0,
      });
      await linkRepo.create('person-1', 'location-1', {
        relation: 'seen at',
        confidence: 0,
      });
      await linkRepo.create('asset-1', 'person-2', {
        relation: 'belongs to',
        confidence: 0,
      });

      const all = await linkRepo.getAll();
      expect(all).toHaveLength(3);
    });

    it('should only return links for the current case', async () => {
      const otherCase = await new CaseRepo(db).create({ title: 'Other Case' });
      const otherLinkRepo = new CaseLinkRepo(db, otherCase.id);

      await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0,
      });
      await otherLinkRepo.create('person-3', 'person-4', {
        relation: 'knows',
        confidence: 0,
      });

      const myLinks = await linkRepo.getAll();
      const otherLinks = await otherLinkRepo.getAll();

      expect(myLinks).toHaveLength(1);
      expect(otherLinks).toHaveLength(1);
      expect(myLinks[0].sourceId).toBe('person-1');
      expect(otherLinks[0].sourceId).toBe('person-3');
    });
  });

  describe('update', () => {
    it('should update link data', async () => {
      const created = await linkRepo.create('person-1', 'person-2', {
        relation: 'suspects',
        confidence: 0.7,
      });

      const updated = await linkRepo.update(created.createdAt, 'person-1', 'person-2', {
        relation: 'accomplices',
        confidence: 0.95,
      });

      expect(updated.sourceId).toBe('person-1');
      expect(updated.targetId).toBe('person-2');
      expect(updated.relation).toBe('accomplices');
      expect(updated.confidence).toBe(0.95);
    });
  });

  describe('delete', () => {
    it('should delete a link', async () => {
      const created = await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0,
      });

      await linkRepo.delete(created.createdAt, 'person-1', 'person-2');

      const all = await linkRepo.getAll();
      expect(all).toHaveLength(0);
    });

    it('should only delete the specified link', async () => {
      const link1 = await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0,
      });
      const _link2 = await linkRepo.create('person-2', 'person-1', {
        relation: 'is known by',
        confidence: 0,
      });
      const _link3 = await linkRepo.create('person-1', 'location-1', {
        relation: 'seen at',
        confidence: 0,
      });

      await linkRepo.delete(link1.createdAt, 'person-1', 'person-2');

      const all = await linkRepo.getAll();
      expect(all).toHaveLength(2);

      const link2Check = all.find((l) => l.sourceId === 'person-2' && l.targetId === 'person-1');
      const link3Check = all.find((l) => l.sourceId === 'person-1' && l.targetId === 'location-1');

      expect(link2Check).toBeDefined();
      expect(link3Check).toBeDefined();
    });
  });

  describe('deleteAll', () => {
    it('should delete all links for a case', async () => {
      await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0,
      });
      await linkRepo.create('person-1', 'location-1', {
        relation: 'seen at',
        confidence: 0,
      });
      await linkRepo.create('asset-1', 'person-2', {
        relation: 'belongs to',
        confidence: 0,
      });

      await linkRepo.deleteAll();

      const all = await linkRepo.getAll();
      expect(all).toHaveLength(0);
    });

    it('should not affect other cases', async () => {
      const otherCase = await new CaseRepo(db).create({ title: 'Other Case' });
      const otherLinkRepo = new CaseLinkRepo(db, otherCase.id);

      await linkRepo.create('person-1', 'person-2', {
        relation: 'knows',
        confidence: 0,
      });
      await otherLinkRepo.create('person-3', 'person-4', {
        relation: 'knows',
        confidence: 0,
      });

      await linkRepo.deleteAll();

      const otherLinks = await otherLinkRepo.getAll();
      expect(otherLinks).toHaveLength(1);
    });
  });

  describe('Integration', () => {
    it('should handle complex entity relationship graphs', async () => {
      // Create a network of relationships
      const person1 = 'person-1';
      const person2 = 'person-2';
      const suspect = 'suspect-1';
      const location = 'location-1';
      const asset = 'weapon-1';

      // Build relationships
      const link1 = await linkRepo.create(person1, person2, {
        relation: 'accomplice',
        confidence: 0.95,
      });
      const link2 = await linkRepo.create(suspect, location, {
        relation: 'last seen at',
        confidence: 0.8,
      });
      const _link3 = await linkRepo.create(asset, suspect, {
        relation: 'found on',
        confidence: 0.99,
      });

      const all = await linkRepo.getAll();
      expect(all).toHaveLength(3);

      // Update confidence
      await linkRepo.update(link1.createdAt, person1, person2, {
        relation: 'accomplice',
        confidence: 0.98,
      });

      const updated = await linkRepo.getById(link1.createdAt, person1, person2);
      expect(updated.confidence).toBe(0.98);

      // Delete one link
      await linkRepo.delete(link2.createdAt, suspect, location);

      const remaining = await linkRepo.getAll();
      expect(remaining).toHaveLength(2);
    });

    it('should manage multiple independent link structures', async () => {
      // First case links
      await linkRepo.create('a', 'b', {
        relation: 'links to',
        confidence: 0,
      });
      await linkRepo.create('a', 'c', {
        relation: 'links to',
        confidence: 0,
      });
      await linkRepo.create('b', 'c', {
        relation: 'links to',
        confidence: 0,
      });

      // Second case links (different case)
      const case2 = await new CaseRepo(db).create({ title: 'Case 2' });
      const linkRepo2 = new CaseLinkRepo(db, case2.id);

      await linkRepo2.create('x', 'y', {
        relation: 'connects to',
        confidence: 0,
      });
      await linkRepo2.create('y', 'z', {
        relation: 'connects to',
        confidence: 0,
      });

      // Verify isolation
      let myLinks = await linkRepo.getAll();
      let case2Links = await linkRepo2.getAll();

      expect(myLinks).toHaveLength(3);
      expect(case2Links).toHaveLength(2);

      // Delete from case 1
      const firstLink = myLinks[0];
      await linkRepo.delete(firstLink.createdAt, firstLink.sourceId, firstLink.targetId);

      // Verify case 2 unaffected
      case2Links = await linkRepo2.getAll();
      expect(case2Links).toHaveLength(2);

      myLinks = await linkRepo.getAll();
      expect(myLinks).toHaveLength(2);
    });
  });
});
