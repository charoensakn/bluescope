import { describe, expect, it } from 'vitest';
import { LinkAnalysisAgent } from './link_analysis';

describe('LinkAnalysisAgent', () => {
  function makeAgent() {
    return new LinkAnalysisAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns link-analysis-v1', () => {
      expect(makeAgent().name()).toBe('link-analysis-v1');
    });
  });

  describe('output', () => {
    it('returns JSON output', () => {
      const out = makeAgent().output({});
      expect(out.name).toBe('json');
    });
  });

  describe('systemPrompt', () => {
    it('returns a non-empty prompt', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains link analysis instructions', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(prompt).toContain('links');
      expect(prompt).toContain('source_id');
      expect(prompt).toContain('target_id');
      expect(prompt).toContain('relation');
      expect(prompt).toContain('confidence');
    });
  });

  describe('userPrompt', () => {
    it('includes English instruction with story and entities', () => {
      const prompt = makeAgent().userPrompt({
        description: 'A robbery.',
        entity: 'Persons: John',
      });
      expect(prompt).toContain('generate all meaningful links');
      expect(prompt).toContain('Input story:');
      expect(prompt).toContain('Input entities:');
      expect(prompt).toContain('A robbery.');
      expect(prompt).toContain('Persons: John');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({
        description: 'คดี',
        entity: 'บุคคล',
        thai: true,
      });
      expect(prompt).toContain('สร้างความเชื่อมโยง');
      expect(prompt).toContain('อินพุตเรื่อง:');
      expect(prompt).toContain('อินพุตเอนทิตี:');
    });

    it('handles no description or entity gracefully', () => {
      const prompt = makeAgent().userPrompt({});
      expect(typeof prompt).toBe('string');
    });

    it('includes only story section when no entity', () => {
      const prompt = makeAgent().userPrompt({ description: 'A case.' });
      expect(prompt).not.toContain('Input entities:');
    });

    it('includes only entities section when no description', () => {
      const prompt = makeAgent().userPrompt({ entity: 'Persons: Jane' });
      expect(prompt).not.toContain('Input story:');
    });
  });
});
