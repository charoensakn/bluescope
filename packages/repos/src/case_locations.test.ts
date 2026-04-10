import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseLocationRepo } from './case_locations';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseLocationRepo', () => {
  let locationRepo: CaseLocationRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    locationRepo = new CaseLocationRepo(db, caseId);
  });

  describe('create', () => {
    it('should create a location', async () => {
      const locationData = {
        id: 'location-1',
        types: 'address',
        name: 'Crime Scene',
        locationDetails: '123 Main St, Downtown',
        confidence: 0.95,
      };

      const created = await locationRepo.create(locationData);

      expect(created.caseId).toBe(caseId);
      expect(created.types).toBe('address');
      expect(created.name).toBe('Crime Scene');
      expect(created.confidence).toBe(0.95);
    });
  });

  describe('getById', () => {
    it('should retrieve location by timestamp', async () => {
      const created = await locationRepo.create({
        types: 'building',
        name: 'Bank branch',
        locationDetails: 'Downtown location',
        id: '',
        confidence: 0,
      });

      const retrieved = await locationRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.types).toBe('building');
    });

    it('should throw if not found', async () => {
      await expect(locationRepo.getById(999999)).rejects.toThrow('Case location not found');
    });
  });

  describe('getAll', () => {
    it('should return all locations', async () => {
      await locationRepo.create({
        types: 'address',
        name: 'Location 1',
        id: '',
        confidence: 0,
        locationDetails: '',
      });
      await locationRepo.create({
        types: 'city',
        name: 'Location 2',
        id: '',
        confidence: 0,
        locationDetails: '',
      });
      await locationRepo.create({
        types: 'landmark',
        name: 'Location 3',
        id: '',
        confidence: 0,
        locationDetails: '',
      });

      const all = await locationRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update location', async () => {
      const created = await locationRepo.create({
        types: 'address',
        name: 'Original location',
        confidence: 0.7,
        id: '',
        locationDetails: '',
      });

      const updated = await locationRepo.update(created.createdAt, {
        name: 'Updated location',
        confidence: 0.95,
        id: '',
        types: '',
        locationDetails: '',
      });

      expect(updated.name).toBe('Updated location');
      expect(updated.confidence).toBe(0.95);
    });
  });

  describe('delete', () => {
    it('should delete location', async () => {
      const created = await locationRepo.create({
        types: 'coordinate',
        name: 'GPS coordinates',
        id: '',
        confidence: 0,
        locationDetails: '',
      });

      await locationRepo.delete(created.createdAt);

      const all = await locationRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });
});
