import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CaseEventRepo } from './case_events';
import { CaseRepo } from './cases';
import { connect, migrate } from './test_db';

describe('CaseEventRepo', () => {
  let eventRepo: CaseEventRepo;
  let caseId: string;
  let db: ReturnType<typeof connect>;

  beforeEach(async () => {
    db = connect();
    migrate(db, path.join(__dirname, '..', 'drizzle'));
    const caseRepo = new CaseRepo(db);
    const createdCase = await caseRepo.create({ title: 'Test Case' });
    caseId = createdCase.id;
    eventRepo = new CaseEventRepo(db, caseId);
  });

  describe('create', () => {
    it('should create an event', async () => {
      const eventData = {
        id: 'event-1',
        types: 'arrest',
        name: 'Suspect arrested',
        occurrenceTime: '2025-03-28T14:30:00Z',
        eventDetails: 'Arrested at downtown station',
        confidence: 0.99,
      };

      const created = await eventRepo.create(eventData);

      expect(created.caseId).toBe(caseId);
      expect(created.types).toBe('arrest');
      expect(created.name).toBe('Suspect arrested');
      expect(created.occurrenceTime).toBe('2025-03-28T14:30:00Z');
    });
  });

  describe('getById', () => {
    it('should retrieve event by timestamp', async () => {
      const created = await eventRepo.create({
        types: 'interview',
        name: 'Witness interview',
        occurrenceTime: '2025-03-28T10:00:00Z',
        id: '',
        confidence: 0,
        eventDetails: '',
      });

      const retrieved = await eventRepo.getById(created.createdAt);

      expect(retrieved.caseId).toBe(caseId);
      expect(retrieved.types).toBe('interview');
    });

    it('should throw if not found', async () => {
      await expect(eventRepo.getById(999999)).rejects.toThrow('Case event not found');
    });
  });

  describe('getAll', () => {
    it('should return all events', async () => {
      await eventRepo.create({
        types: 'arrest',
        name: 'Event 1',
        id: '',
        confidence: 0,
        occurrenceTime: '',
        eventDetails: '',
      });
      await eventRepo.create({
        types: 'interview',
        name: 'Event 2',
        id: '',
        confidence: 0,
        occurrenceTime: '',
        eventDetails: '',
      });
      await eventRepo.create({
        types: 'seizure',
        name: 'Event 3',
        id: '',
        confidence: 0,
        occurrenceTime: '',
        eventDetails: '',
      });

      const all = await eventRepo.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      const created = await eventRepo.create({
        types: 'arrest',
        name: 'Original',
        confidence: 0.8,
        id: '',
        occurrenceTime: '',
        eventDetails: '',
      });

      const updated = await eventRepo.update(created.createdAt, {
        name: 'Updated arrest',
        confidence: 0.95,
        id: '',
        types: '',
        occurrenceTime: '',
        eventDetails: '',
      });

      expect(updated.name).toBe('Updated arrest');
      expect(updated.confidence).toBe(0.95);
    });
  });

  describe('delete', () => {
    it('should delete event', async () => {
      const created = await eventRepo.create({
        types: 'report',
        name: 'Police report filed',
        id: '',
        confidence: 0,
        occurrenceTime: '',
        eventDetails: '',
      });

      await eventRepo.delete(created.createdAt);

      const all = await eventRepo.getAll();
      expect(all).toHaveLength(0);
    });
  });
});
