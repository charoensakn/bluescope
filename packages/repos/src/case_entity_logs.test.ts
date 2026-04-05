import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseEntityLogRepo } from './case_entity_logs';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseEntityLogRepo', () => {
  let entityLogRepo: CaseEntityLogRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    entityLogRepo = new CaseEntityLogRepo(db, caseId);
  });

  describe('create', () => {
    it('should create an entity log', async () => {
      const logData = {
        inputDescription: 'Description about suspect',
        inputEntity: 'Person',
        entity: 'John Doe',
      };

      const created = await entityLogRepo.create(logData);

      expect(created.caseId).toBe(caseId);
      expect(created.inputDescription).toBe('Description about suspect');
      expect(created.inputEntity).toBe('Person');
      expect(created.entity).toBe('John Doe');
      expect(created.createdAt).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should retrieve entity log by timestamp', async () => {
      const created = await entityLogRepo.create({
        inputDescription: 'Location description',
        inputEntity: 'Location',
        entity: 'Downtown street corner',
      });

      const retrieved = await entityLogRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.inputEntity).toBe('Location');
      expect(retrieved.entity).toBe('Downtown street corner');
    });

    it('should throw if not found', async () => {
      await expect(entityLogRepo.getById(999999)).rejects.toThrow('Case entity log not found');
    });
  });

  describe('getAll', () => {
    it('should return all entity logs', async () => {
      await entityLogRepo.create({
        inputDescription: 'Log 1',
        inputEntity: 'Person',
        entity: 'Entity 1',
      });
      await entityLogRepo.create({
        inputDescription: 'Log 2',
        inputEntity: 'Organization',
        entity: 'Entity 2',
      });

      const all = await entityLogRepo.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete entity log', async () => {
      const created = await entityLogRepo.create({
        inputDescription: 'Test input',
        inputEntity: 'Type',
        entity: 'Result',
      });

      await entityLogRepo.delete(created.createdAt);

      const all = await entityLogRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('deleteAll', () => {
    it('should delete all entity logs for a case', async () => {
      await entityLogRepo.create({
        inputDescription: 'Log 1',
        entity: 'Result 1',
        inputEntity: '',
      });
      await entityLogRepo.create({
        inputDescription: 'Log 2',
        entity: 'Result 2',
        inputEntity: '',
      });

      await entityLogRepo.deleteAll();

      const all = await entityLogRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('getLast', () => {
    it('should return the most recent entity log', async () => {
      await entityLogRepo.create({
        inputDescription: 'First',
        inputEntity: 'Person',
        entity: 'Alice',
      });
      await new Promise((resolve) => setTimeout(resolve, 2));
      await entityLogRepo.create({
        inputDescription: 'Second',
        inputEntity: 'Location',
        entity: 'Bangkok',
      });

      const last = await entityLogRepo.getLast();

      expect(last.inputEntity).toBe('Location');
      expect(last.entity).toBe('Bangkok');
    });

    it('should throw if no logs exist', async () => {
      await expect(entityLogRepo.getLast()).rejects.toThrow('Case entity log not found');
    });
  });
});
