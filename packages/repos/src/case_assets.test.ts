import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CaseAssetRepo } from './case_assets';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseAssetRepo', () => {
  let caseRepo: CaseRepo;
  let assetRepo: CaseAssetRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    assetRepo = new CaseAssetRepo(db, caseId);
  });

  afterEach(() => {
    // Clean up
  });

  describe('create', () => {
    it('should create a new case asset', async () => {
      const assetData = {
        id: 'asset-1',
        types: 'vehicle',
        name: 'Red Honda Civic',
        assetDetails: 'License Plate: ABC-123',
        confidence: 0.95,
      };

      const created = await assetRepo.create(assetData);

      expect(created.caseId).toBe(caseId);
      expect(created.id).toBe('asset-1');
      expect(created.types).toBe('vehicle');
      expect(created.name).toBe('Red Honda Civic');
      expect(created.confidence).toBe(0.95);
      expect(created.createdAt).toBeDefined();
    });

    it('should handle multiple assets with different types', async () => {
      const _asset1 = await assetRepo.create({
        types: 'vehicle',
        name: 'Car',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      const _asset2 = await assetRepo.create({
        types: 'phone',
        name: 'iPhone 14',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      const _asset3 = await assetRepo.create({
        types: 'weapon',
        name: 'Handgun',
        id: '',
        confidence: 0,
        assetDetails: '',
      });

      const all = await assetRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('getById', () => {
    it('should retrieve an asset by createdAt timestamp', async () => {
      const created = await assetRepo.create({
        name: 'Stolen Necklace',
        types: 'jewelry',
        id: '',
        confidence: 0,
        assetDetails: '',
      });

      const retrieved = await assetRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.name).toBe('Stolen Necklace');
      expect(retrieved.types).toBe('jewelry');
    });

    it('should throw error if asset not found', async () => {
      await expect(assetRepo.getById(999999)).rejects.toThrow('Case asset not found');
    });
  });

  describe('getAll', () => {
    it('should return all assets for the case', async () => {
      const _asset1 = await assetRepo.create({
        name: 'Asset 1',
        types: 'vehicle',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      const _asset2 = await assetRepo.create({
        name: 'Asset 2',
        types: 'phone',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      const _asset3 = await assetRepo.create({
        name: 'Asset 3',
        types: 'money',
        id: '',
        confidence: 0,
        assetDetails: '',
      });

      const all = await assetRepo.getAll();

      expect(all).toHaveLength(3);
    });

    it('should only return assets for the current case', async () => {
      const otherCase = await caseRepo.create({ title: 'Other Case' });
      const otherAssetRepo = new CaseAssetRepo(db, otherCase.id);

      await assetRepo.create({
        name: 'Asset 1',
        types: 'vehicle',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      await assetRepo.create({
        name: 'Asset 2',
        types: 'phone',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      await otherAssetRepo.create({
        name: 'Asset 3',
        types: 'weapon',
        id: '',
        confidence: 0,
        assetDetails: '',
      });

      const myAssets = await assetRepo.getAll();
      const otherAssets = await otherAssetRepo.getAll();

      expect(myAssets).toHaveLength(2);
      expect(otherAssets).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update asset details', async () => {
      const created = await assetRepo.create({
        name: 'Original Name',
        types: 'vehicle',
        confidence: 0.8,
        id: '',
        assetDetails: '',
      });

      const updated = await assetRepo.update(created.createdAt, {
        name: 'Updated Name',
        confidence: 0.95,
        id: '',
        types: 'vehicle',
        assetDetails: '',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.confidence).toBe(0.95);
      expect(updated.types).toBe('vehicle');
    });
  });

  describe('delete', () => {
    it('should delete an asset', async () => {
      const created = await assetRepo.create({
        name: 'Asset to Delete',
        types: 'weapon',
        id: '',
        confidence: 0,
        assetDetails: '',
      });

      await assetRepo.delete(created.createdAt);

      await expect(assetRepo.getById(created.createdAt)).rejects.toThrow('Case asset not found');
    });
  });

  describe('deleteAll', () => {
    it('should delete all assets for a case', async () => {
      await assetRepo.create({
        name: 'Asset 1',
        types: 'vehicle',
        id: '',
        confidence: 0,
        assetDetails: '',
      });
      await assetRepo.create({
        name: 'Asset 2',
        types: 'phone',
        id: '',
        confidence: 0,
        assetDetails: '',
      });

      await assetRepo.deleteAll();

      const all = await assetRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('Integration', () => {
    it('should handle asset management workflow', async () => {
      // Create assets
      const asset1 = await assetRepo.create({
        name: 'Stolen Laptop',
        types: 'equipment',
        assetDetails: 'MacBook Pro 16"',
        confidence: 0.9,
        id: '',
      });
      const asset2 = await assetRepo.create({
        name: 'Cash',
        types: 'money',
        assetDetails: '$5,000 USD',
        confidence: 0.95,
        id: '',
      });

      // Verify creation
      let all = await assetRepo.getAll();
      expect(all).toHaveLength(2);

      // Update
      const updated = await assetRepo.update(asset1.createdAt, {
        name: 'Recovered Laptop',
        id: '',
        confidence: 0,
        types: '',
        assetDetails: '',
      });
      expect(updated.name).toBe('Recovered Laptop');

      // Delete
      await assetRepo.delete(asset2.createdAt);

      all = await assetRepo.getAll();
      expect(all).toHaveLength(1);
    });
  });
});
