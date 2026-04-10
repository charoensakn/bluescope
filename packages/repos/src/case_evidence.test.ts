import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseEvidenceRepo } from './case_evidence';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseEvidenceRepo', () => {
  let evidenceRepo: CaseEvidenceRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    evidenceRepo = new CaseEvidenceRepo(db, caseId);
  });

  describe('create', () => {
    it('should create evidence', async () => {
      const evidenceData = {
        id: 'evidence-1',
        types: 'photo',
        name: 'Crime scene photo',
        evidenceDetails: 'Body cam footage from 2:45 PM',
        confidence: 0.99,
      };

      const created = await evidenceRepo.create(evidenceData);

      expect(created.caseId).toBe(caseId);
      expect(created.types).toBe('photo');
      expect(created.name).toBe('Crime scene photo');
      expect(created.confidence).toBe(0.99);
    });
  });

  describe('getById', () => {
    it('should retrieve evidence by timestamp', async () => {
      const created = await evidenceRepo.create({
        types: 'fingerprint',
        name: 'Fingerprints on weapon',
        id: '',
        confidence: 0,
        evidenceDetails: '',
      });

      const retrieved = await evidenceRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.types).toBe('fingerprint');
    });

    it('should throw if not found', async () => {
      await expect(evidenceRepo.getById(999999)).rejects.toThrow('Case evidence not found');
    });
  });

  describe('getAll', () => {
    it('should return all evidence', async () => {
      await evidenceRepo.create({
        types: 'photo',
        name: 'Photo 1',
        id: '',
        confidence: 0,
        evidenceDetails: '',
      });
      await evidenceRepo.create({
        types: 'video',
        name: 'Video 1',
        id: '',
        confidence: 0,
        evidenceDetails: '',
      });
      await evidenceRepo.create({
        types: 'dna',
        name: 'DNA sample',
        id: '',
        confidence: 0,
        evidenceDetails: '',
      });

      const all = await evidenceRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update evidence', async () => {
      const created = await evidenceRepo.create({
        types: 'photo',
        name: 'Original name',
        confidence: 0.8,
        id: '',
        evidenceDetails: '',
      });

      const updated = await evidenceRepo.update(created.createdAt, {
        confidence: 0.95,
        id: '',
        types: 'photo',
        name: 'Original name',
        evidenceDetails: '',
      });

      expect(updated.confidence).toBe(0.95);
      expect(updated.name).toBe('Original name');
    });
  });

  describe('delete', () => {
    it('should delete evidence', async () => {
      const created = await evidenceRepo.create({
        types: 'cctv',
        name: 'CCTV footage',
        id: '',
        confidence: 0,
        evidenceDetails: '',
      });

      await evidenceRepo.delete(created.createdAt);

      const all = await evidenceRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });
});
