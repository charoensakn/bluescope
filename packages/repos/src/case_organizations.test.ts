import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseOrganizationRepo } from './case_organizations';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseOrganizationRepo', () => {
  let orgRepo: CaseOrganizationRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    orgRepo = new CaseOrganizationRepo(db, caseId);
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const orgData = {
        id: 'org-1',
        types: 'company',
        name: 'ABC Corporation',
        organizationDetails: 'Tech company, downtown headquarters',
        confidence: 0.95,
      };

      const created = await orgRepo.create(orgData);

      expect(created.caseId).toBe(caseId);
      expect(created.types).toBe('company');
      expect(created.name).toBe('ABC Corporation');
      expect(created.confidence).toBe(0.95);
    });
  });

  describe('getById', () => {
    it('should retrieve organization by timestamp', async () => {
      const created = await orgRepo.create({
        types: 'agency',
        name: 'Police Department',
        organizationDetails: 'Local law enforcement',
        id: '',
        confidence: 0,
      });

      const retrieved = await orgRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.types).toBe('agency');
    });

    it('should throw if not found', async () => {
      await expect(orgRepo.getById(999999)).rejects.toThrow('Case organization not found');
    });
  });

  describe('getAll', () => {
    it('should return all organizations', async () => {
      await orgRepo.create({
        types: 'company',
        name: 'Org 1',
        id: '',
        confidence: 0,
        organizationDetails: '',
      });
      await orgRepo.create({
        types: 'agency',
        name: 'Org 2',
        id: '',
        confidence: 0,
        organizationDetails: '',
      });
      await orgRepo.create({
        types: 'bank',
        name: 'Org 3',
        id: '',
        confidence: 0,
        organizationDetails: '',
      });

      const all = await orgRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      const created = await orgRepo.create({
        types: 'company',
        name: 'Original name',
        confidence: 0.8,
        id: '',
        organizationDetails: '',
      });

      const updated = await orgRepo.update(created.createdAt, {
        name: 'Updated name',
        confidence: 0.92,
        id: '',
        types: '',
        organizationDetails: '',
      });

      expect(updated.name).toBe('Updated name');
      expect(updated.confidence).toBe(0.92);
    });
  });

  describe('delete', () => {
    it('should delete organization', async () => {
      const created = await orgRepo.create({
        types: 'institution',
        name: 'University',
        id: '',
        confidence: 0,
        organizationDetails: '',
      });

      await orgRepo.delete(created.createdAt);

      const all = await orgRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });
});
