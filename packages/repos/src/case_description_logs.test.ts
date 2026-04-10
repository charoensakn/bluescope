import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseDescriptionLogRepo } from './case_description_logs';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseDescriptionLogRepo', () => {
  let descLogRepo: CaseDescriptionLogRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    descLogRepo = new CaseDescriptionLogRepo(db, caseId);
  });

  describe('create', () => {
    it('should create a description log', async () => {
      const logData = {
        inputDescription: 'Original description input',
        inputEntity: 'Original entity input',
        description: 'Processed description',
      };

      const created = await descLogRepo.create(logData);

      expect(created.caseId).toBe(caseId);
      expect(created.inputDescription).toBe('Original description input');
      expect(created.inputEntity).toBe('Original entity input');
      expect(created.description).toBe('Processed description');
      expect(created.createdAt).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should retrieve log by timestamp', async () => {
      const created = await descLogRepo.create({
        inputDescription: 'Input text',
        description: 'Output text',
        inputEntity: '',
      });

      const retrieved = await descLogRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.inputDescription).toBe('Input text');
      expect(retrieved.description).toBe('Output text');
    });

    it('should throw if not found', async () => {
      await expect(descLogRepo.getById(999999)).rejects.toThrow('Case description log not found');
    });
  });

  describe('getAll', () => {
    it('should return all description logs', async () => {
      await descLogRepo.create({
        inputDescription: 'Log 1',
        description: 'Desc 1',
        inputEntity: '',
      });
      await descLogRepo.create({
        inputDescription: 'Log 2',
        description: 'Desc 2',
        inputEntity: '',
      });

      const all = await descLogRepo.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete description log', async () => {
      const created = await descLogRepo.create({
        inputDescription: 'Input',
        description: 'Output',
        inputEntity: '',
      });

      await descLogRepo.delete(created.createdAt);

      const all = await descLogRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('deleteAll', () => {
    it('should delete all logs for a case', async () => {
      await descLogRepo.create({
        inputDescription: 'Log 1',
        description: '',
        inputEntity: '',
      });
      await descLogRepo.create({
        inputDescription: 'Log 2',
        description: '',
        inputEntity: '',
      });

      await descLogRepo.deleteAll();

      const all = await descLogRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('getLast', () => {
    it('should return the most recent description log', async () => {
      await descLogRepo.create({
        inputDescription: 'First',
        description: 'v1',
        inputEntity: '',
      });
      await new Promise((resolve) => setTimeout(resolve, 2));
      await descLogRepo.create({
        inputDescription: 'Second',
        description: 'v2',
        inputEntity: '',
      });

      const last = await descLogRepo.getLast();

      expect(last.inputDescription).toBe('Second');
      expect(last.description).toBe('v2');
    });

    it('should throw if no logs exist', async () => {
      await expect(descLogRepo.getLast()).rejects.toThrow('Case description log not found');
    });
  });
});
