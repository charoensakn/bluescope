import { describe, expect, it } from 'vitest';
import { DescriptionRefinementAgent } from './description_refinement';

describe('DescriptionRefinementAgent', () => {
  function makeAgent() {
    return new DescriptionRefinementAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns description-refinement-v1', () => {
      expect(makeAgent().name()).toBe('description-refinement-v1');
    });
  });

  describe('systemPrompt', () => {
    it('returns story-only prompt when only description provided', () => {
      const prompt = makeAgent().systemPrompt({ description: 'A case narrative.' });
      expect(prompt).toContain('story refinement');
      expect(prompt).toContain('Clarity');
    });

    it('returns entity-to-story prompt when only entity provided', () => {
      const prompt = makeAgent().systemPrompt({ entity: 'Persons: John' });
      expect(prompt).toContain('story generation');
    });

    it('returns combined prompt when both description and entity provided', () => {
      const prompt = makeAgent().systemPrompt({
        description: 'A case.',
        entity: 'Persons: Jane',
      });
      expect(prompt).toContain('story refinement');
      expect(prompt).toContain('entities');
    });

    it('throws when neither description nor entity provided', () => {
      expect(() => makeAgent().systemPrompt({})).toThrow('At least one of description or entity must be provided');
    });
  });

  describe('userPrompt - description only', () => {
    it('includes English instruction and story block', () => {
      const prompt = makeAgent().userPrompt({ description: 'A robbery.' });
      expect(prompt).toContain('Refine the following story');
      expect(prompt).toContain('Input story:');
      expect(prompt).toContain('A robbery.');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({ description: 'คดีปล้น', thai: true });
      expect(prompt).toContain('ปรับปรุงเรื่องราว');
      expect(prompt).toContain('อินพุตเรื่อง:');
      expect(prompt).toContain('คดีปล้น');
    });
  });

  describe('userPrompt - entity only', () => {
    it('includes English instruction and entities block', () => {
      const prompt = makeAgent().userPrompt({ entity: 'Persons: John' });
      expect(prompt).toContain('Write a coherent story');
      expect(prompt).toContain('Input entities:');
      expect(prompt).toContain('Persons: John');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({ entity: 'บุคคล: สมชาย', thai: true });
      expect(prompt).toContain('เขียนเรื่องราว');
      expect(prompt).toContain('อินพุตเอนทิตี:');
    });
  });

  describe('userPrompt - both description and entity', () => {
    it('includes English instruction, story block, and entities block', () => {
      const prompt = makeAgent().userPrompt({
        description: 'A fraud.',
        entity: 'Persons: Jane',
      });
      expect(prompt).toContain('Refine the story using the entities');
      expect(prompt).toContain('Input story:');
      expect(prompt).toContain('Input entities:');
      expect(prompt).toContain('A fraud.');
      expect(prompt).toContain('Persons: Jane');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({
        description: 'คดี',
        entity: 'บุคคล',
        thai: true,
      });
      expect(prompt).toContain('ปรับปรุงเรื่องราวโดยใช้เอนทิตี');
    });
  });
});
