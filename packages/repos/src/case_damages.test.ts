import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseDamageRepo } from './case_damages';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseDamageRepo', () => {
  let damageRepo: CaseDamageRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    damageRepo = new CaseDamageRepo(db, caseId);
  });

  describe('create', () => {
    it('should create a new damage record', async () => {
      const damageData = {
        id: 'damage-1',
        types: 'injury',
        name: 'Head wounds',
        damageDetails: 'Multiple lacerations',
        value: 'Severe',
        confidence: 0.95,
      };

      const created = await damageRepo.create(damageData);

      expect(created.caseId).toBe(caseId);
      expect(created.types).toBe('injury');
      expect(created.confidence).toBe(0.95);
      expect(created.createdAt).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should retrieve a damage by timestamp', async () => {
      const created = await damageRepo.create({
        types: 'financial loss',
        name: 'Theft',
        value: '$10,000',
        id: '',
        confidence: 0,
        damageDetails: '',
      });

      const retrieved = await damageRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.types).toBe('financial loss');
      expect(retrieved.value).toBe('$10,000');
    });

    it('should throw error if not found', async () => {
      await expect(damageRepo.getById(999999)).rejects.toThrow('Case damage not found');
    });
  });

  describe('getAll', () => {
    it('should return all damages', async () => {
      await damageRepo.create({
        types: 'injury',
        name: 'Injury 1',
        id: '',
        confidence: 0,
        damageDetails: '',
        value: '',
      });
      await damageRepo.create({
        types: 'financial loss',
        name: 'Loss 1',
        id: '',
        confidence: 0,
        damageDetails: '',
        value: '',
      });

      const all = await damageRepo.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update damage details', async () => {
      const created = await damageRepo.create({
        types: 'injury',
        name: 'Original',
        value: 'Moderate',
        id: '',
        confidence: 0,
        damageDetails: '',
      });

      const updated = await damageRepo.update(created.createdAt, {
        value: 'Severe',
        id: '',
        types: '',
        confidence: 0,
        name: '',
        damageDetails: '',
      });

      expect(updated.value).toBe('Severe');
    });
  });

  describe('delete', () => {
    it('should delete a damage record', async () => {
      const created = await damageRepo.create({
        types: 'injury',
        name: 'Test',
        id: '',
        confidence: 0,
        damageDetails: '',
        value: '',
      });

      await damageRepo.delete(created.createdAt);

      const all = await damageRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });
});
