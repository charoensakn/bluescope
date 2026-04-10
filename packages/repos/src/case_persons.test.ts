import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CasePersonRepo } from './case_persons';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CasePersonRepo', () => {
  let caseRepo: CaseRepo;
  let personRepo: CasePersonRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    personRepo = new CasePersonRepo(db, caseId);
  });

  afterEach(() => {
    // Clean up
  });

  describe('create', () => {
    it('should create a new case person', async () => {
      const personData = {
        id: 'person-1',
        types: 'suspect',
        name: 'John Doe',
        personDetails: 'Detailed information',
        condition: 'arrested',
        confidence: 0.95,
      };

      const created = await personRepo.create(personData);

      expect(created.caseId).toBe(caseId);
      expect(created.id).toBe('person-1');
      expect(created.types).toBe('suspect');
      expect(created.name).toBe('John Doe');
      expect(created.confidence).toBe(0.95);
      expect(created.createdAt).toBeDefined();
    });

    it('should generate unique timestamps for multiple persons', async () => {
      const person1 = await personRepo.create({
        name: 'Person 1',
        types: 'suspect',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      const person2 = await personRepo.create({
        name: 'Person 2',
        types: 'victim',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      expect(person1.createdAt).not.toBe(person2.createdAt);
    });
  });

  describe('getById', () => {
    it('should retrieve a person by createdAt timestamp', async () => {
      const created = await personRepo.create({
        name: 'Jane Doe',
        types: 'witness',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      const retrieved = await personRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.name).toBe('Jane Doe');
      expect(retrieved.types).toBe('witness');
    });

    it('should throw error if person not found', async () => {
      await expect(personRepo.getById(999999)).rejects.toThrow('Case person not found');
    });
  });

  describe('getAll', () => {
    it('should return all persons for the case', async () => {
      const _person1 = await personRepo.create({
        name: 'Person 1',
        types: 'suspect',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      const _person2 = await personRepo.create({
        name: 'Person 2',
        types: 'victim',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      const _person3 = await personRepo.create({
        name: 'Person 3',
        types: 'witness',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      const all = await personRepo.getAll();

      expect(all).toHaveLength(3);
      expect(all.map((p) => p.name)).toContain('Person 1');
      expect(all.map((p) => p.name)).toContain('Person 2');
      expect(all.map((p) => p.name)).toContain('Person 3');
    });

    it('should return empty array when no persons exist', async () => {
      const all = await personRepo.getAll();

      expect(all).toHaveLength(0);
    });

    it('should only return persons for the current case', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherPersonRepo = new CasePersonRepo(db, otherCase.id);

      await personRepo.create({
        name: 'Person 1',
        types: 'suspect',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      await personRepo.create({
        name: 'Person 2',
        types: 'victim',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      await otherPersonRepo.create({
        name: 'Person 3',
        types: 'witness',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      const myPersons = await personRepo.getAll();
      const otherPersons = await otherPersonRepo.getAll();

      expect(myPersons).toHaveLength(2);
      expect(otherPersons).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update person details', async () => {
      const created = await personRepo.create({
        name: 'Original Name',
        types: 'suspect',
        condition: 'at-large',
        id: '',
        confidence: 0,
        personDetails: '',
      });

      const updated = await personRepo.update(created.createdAt, {
        name: 'Updated Name',
        condition: 'arrested',
        id: '',
        types: 'suspect',
        confidence: 0,
        personDetails: '',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.condition).toBe('arrested');
      expect(updated.types).toBe('suspect');
      expect(updated.createdAt).toBe(created.createdAt);
    });

    it('should throw error if person not found', async () => {
      await expect(
        personRepo.update(999999, {
          name: 'Updated',
          id: '',
          types: '',
          confidence: 0,
          personDetails: '',
          condition: '',
        }),
      ).rejects.toThrow('Case person not found');
    });
  });

  describe('delete', () => {
    it('should delete a person', async () => {
      const created = await personRepo.create({
        name: 'Person to Delete',
        types: 'suspect',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      await personRepo.delete(created.createdAt);

      await expect(personRepo.getById(created.createdAt)).rejects.toThrow('Case person not found');
    });
  });

  describe('deleteAll', () => {
    it('should delete all persons for a case', async () => {
      await personRepo.create({
        name: 'Person 1',
        types: 'suspect',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      await personRepo.create({
        name: 'Person 2',
        types: 'victim',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      await personRepo.create({
        name: 'Person 3',
        types: 'witness',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      await personRepo.deleteAll();

      const all = await personRepo.getAll();
      expect(all).toHaveLength(0);
    });

    it('should not affect other cases', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherPersonRepo = new CasePersonRepo(db, otherCase.id);

      await personRepo.create({
        name: 'Person 1',
        types: 'suspect',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      await personRepo.create({
        name: 'Person 2',
        types: 'victim',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });
      await otherPersonRepo.create({
        name: 'Person 3',
        types: 'witness',
        id: '',
        confidence: 0,
        personDetails: '',
        condition: '',
      });

      await personRepo.deleteAll();

      const otherPersons = await otherPersonRepo.getAll();
      expect(otherPersons).toHaveLength(1);
    });
  });

  describe('Integration', () => {
    it('should handle complete person workflow', async () => {
      // Create persons
      const person1 = await personRepo.create({
        name: 'John Doe',
        types: 'suspect',
        condition: 'at-large',
        confidence: 0.95,
        id: '',
        personDetails: '',
      });
      const person2 = await personRepo.create({
        name: 'Jane Smith',
        types: 'victim',
        confidence: 0.99,
        id: '',
        personDetails: '',
        condition: '',
      });

      // List all
      let all = await personRepo.getAll();
      expect(all).toHaveLength(2);

      // Update person
      const updated = await personRepo.update(person1.createdAt, {
        condition: 'arrested',
        confidence: 0.98,
        id: '',
        types: 'suspect',
        name: 'John Doe',
        personDetails: '',
      });
      expect(updated.condition).toBe('arrested');

      // Delete one
      await personRepo.delete(person2.createdAt);

      all = await personRepo.getAll();
      expect(all).toHaveLength(1);

      // Verify remaining
      const remaining = await personRepo.getById(person1.createdAt);
      expect(remaining.name).toBe('John Doe');
    });
  });
});
