import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { PresetRepo } from './presets';
import { connect, migrate } from './test_db';

describe('PresetRepo', () => {
  let repo: PresetRepo;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    await migrate(db, path.join(__dirname, '..', 'drizzle'));
    repo = new PresetRepo(db);
  });

  describe('create', () => {
    it('should create a new preset', async () => {
      const data = {
        name: 'Test Preset',
        providerId: 'provider-1',
        prompt: 'You are a helpful assistant.',
      };

      const preset = await repo.create(data);

      expect(preset.id).toBeDefined();
      expect(preset.name).toBe('Test Preset');
      expect(preset.providerId).toBe('provider-1');
      expect(preset.prompt).toBe('You are a helpful assistant.');
    });

    it('should generate unique IDs', async () => {
      const preset1 = await repo.create({ name: 'Preset 1' });
      const preset2 = await repo.create({ name: 'Preset 2' });

      expect(preset1.id).not.toBe(preset2.id);
    });

    it('should create a preset with partial data', async () => {
      const preset = await repo.create({ name: 'Minimal Preset' });

      expect(preset.id).toBeDefined();
      expect(preset.name).toBe('Minimal Preset');
      expect(preset.providerId).toBeNull();
      expect(preset.prompt).toBeNull();
    });
  });

  describe('getById', () => {
    it('should retrieve a preset by ID', async () => {
      const created = await repo.create({
        name: 'Test Preset',
        providerId: 'p1',
      });

      const retrieved = await repo.getById(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test Preset');
      expect(retrieved.providerId).toBe('p1');
    });

    it('should throw error if preset not found', async () => {
      await expect(repo.getById('non-existent-id')).rejects.toThrow('Preset not found');
    });
  });

  describe('getAll', () => {
    it('should return all presets', async () => {
      await repo.create({ name: 'Preset A' });
      await repo.create({ name: 'Preset B' });

      const presets = await repo.getAll();

      expect(presets).toHaveLength(2);
    });

    it('should return empty array when no presets exist', async () => {
      const presets = await repo.getAll();

      expect(presets).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a preset', async () => {
      const created = await repo.create({
        name: 'Original',
        prompt: 'Old prompt',
      });

      const updated = await repo.update(created.id, {
        name: 'Updated',
        prompt: 'New prompt',
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated');
      expect(updated.prompt).toBe('New prompt');
    });

    it('should partially update a preset', async () => {
      const created = await repo.create({ name: 'Original', providerId: 'p1' });

      const updated = await repo.update(created.id, { name: 'Changed' });

      expect(updated.name).toBe('Changed');
      expect(updated.providerId).toBe('p1');
    });
  });

  describe('delete', () => {
    it('should delete a preset', async () => {
      const created = await repo.create({ name: 'To Delete' });

      await repo.delete(created.id);

      await expect(repo.getById(created.id)).rejects.toThrow('Preset not found');
    });

    it('should not affect other presets when deleting', async () => {
      const preset1 = await repo.create({ name: 'Keep' });
      const preset2 = await repo.create({ name: 'Delete' });

      await repo.delete(preset2.id);

      const presets = await repo.getAll();
      expect(presets).toHaveLength(1);
      expect(presets[0].id).toBe(preset1.id);
    });
  });
});
