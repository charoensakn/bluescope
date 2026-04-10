import { describe, expect, it } from 'vitest';
import { EntityRefinementAgent } from './entity_refinement';

describe('EntityRefinementAgent', () => {
  function makeAgent() {
    return new EntityRefinementAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns entity-refinement-v1', () => {
      expect(makeAgent().name()).toBe('entity-refinement-v1');
    });
  });

  describe('systemPrompt', () => {
    it('returns extraction prompt when only description provided', () => {
      const prompt = makeAgent().systemPrompt({ description: 'A case narrative.' });
      expect(prompt).toContain('entity extraction');
      expect(prompt).toContain('Persons');
      expect(prompt).toContain('Locations');
    });

    it('returns refinement prompt when only entity provided', () => {
      const prompt = makeAgent().systemPrompt({ entity: 'Persons: John' });
      expect(prompt).toContain('entity refinement');
    });

    it('returns combined prompt when both description and entity provided', () => {
      const prompt = makeAgent().systemPrompt({
        description: 'A case.',
        entity: 'Persons: Jane',
      });
      expect(prompt).toContain('entity refinement');
      expect(prompt).toContain('story');
    });

    it('throws when neither description nor entity provided', () => {
      expect(() => makeAgent().systemPrompt({})).toThrow('At least one of description or entity must be provided');
    });
  });

  describe('userPrompt - description only', () => {
    it('includes English instruction and story block', () => {
      const prompt = makeAgent().userPrompt({ description: 'A robbery.' });
      expect(prompt).toContain('Input story:');
      expect(prompt).toContain('A robbery.');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({ description: 'คดีปล้น', thai: true });
      expect(prompt).toContain('อินพุตเรื่อง:');
      expect(prompt).toContain('คดีปล้น');
    });
  });

  describe('userPrompt - entity only', () => {
    it('includes English instruction and entities block', () => {
      const prompt = makeAgent().userPrompt({ entity: 'Persons: John' });
      expect(prompt).toContain('Input entities:');
      expect(prompt).toContain('Persons: John');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({ entity: 'บุคคล: สมชาย', thai: true });
      expect(prompt).toContain('อินพุตเอนทิตี:');
    });
  });

  describe('userPrompt - both description and entity', () => {
    it('includes story and entities blocks', () => {
      const prompt = makeAgent().userPrompt({
        description: 'A fraud.',
        entity: 'Persons: Jane',
      });
      expect(prompt).toContain('Input story:');
      expect(prompt).toContain('Input entities:');
      expect(prompt).toContain('A fraud.');
      expect(prompt).toContain('Persons: Jane');
    });

    it('includes Thai content when thai=true', () => {
      const prompt = makeAgent().userPrompt({
        description: 'คดี',
        entity: 'บุคคล',
        thai: true,
      });
      expect(prompt).toContain('อินพุตเรื่อง:');
      expect(prompt).toContain('อินพุตเอนทิตี:');
    });
  });
});
