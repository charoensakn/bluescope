import { describe, expect, it } from 'vitest';
import { StructureExtractionAgent } from './structure_extraction';

describe('StructureExtractionAgent', () => {
  function makeAgent() {
    return new StructureExtractionAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns structure-extraction-v1', () => {
      expect(makeAgent().name()).toBe('structure-extraction-v1');
    });
  });

  describe('output', () => {
    const validExtractTypes = ['person', 'organization', 'location', 'asset', 'damage', 'evidence', 'event'] as const;

    for (const extract of validExtractTypes) {
      it(`returns JSON output for ${extract} extraction`, () => {
        const out = makeAgent().output({ extract });
        expect(out.name).toBe('json');
      });
    }

    it('throws for unknown extract type', () => {
      const agent = makeAgent();
      // @ts-expect-error: intentionally passing invalid extract type
      expect(() => agent.output({ extract: 'unknown' })).toThrow();
    });
  });

  describe('systemPrompt', () => {
    it('returns a non-empty prompt (same for all extract types)', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ extract: 'person' });
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains knowledge graph extractor instructions', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ extract: 'person' });
      expect(prompt).toContain('knowledge graph extractor');
    });

    it('contains confidence score instructions', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ extract: 'person' });
      expect(prompt).toContain('confidence');
    });
  });

  describe('userPrompt', () => {
    it('includes person schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        description: 'A robbery occurred.',
        entity: 'Persons: John',
        extract: 'person',
      });
      expect(prompt).toContain('person');
      expect(prompt).toContain('PER_');
      expect(prompt).toContain('Input story:');
    });

    it('includes organization schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        description: 'A fraud case.',
        extract: 'organization',
      });
      expect(prompt).toContain('organization');
      expect(prompt).toContain('ORG_');
    });

    it('includes location schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'Scene.', extract: 'location' });
      expect(prompt).toContain('location');
      expect(prompt).toContain('LOC_');
    });

    it('includes asset schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'Assets.', extract: 'asset' });
      expect(prompt).toContain('asset');
    });

    it('includes damage schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'Damages.', extract: 'damage' });
      expect(prompt).toContain('damage');
    });

    it('includes evidence schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'Evidence.', extract: 'evidence' });
      expect(prompt).toContain('evidence');
    });

    it('includes event schema in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'Events.', extract: 'event' });
      expect(prompt).toContain('event');
    });

    it('includes Thai person schema when thai=true', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        description: 'คดี',
        extract: 'person',
        thai: true,
      });
      expect(prompt).toContain('บุคคล');
      expect(prompt).toContain('PER_');
    });

    it('includes Thai organization schema when thai=true', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'คดี', extract: 'organization', thai: true });
      expect(prompt).toContain('องค์กร');
    });

    it('throws for unsupported extract type in English prompt', () => {
      const agent = makeAgent();
      // @ts-expect-error: intentionally passing invalid extract type
      expect(() => agent.userPrompt({ description: 'x', extract: 'unknown' })).toThrow('Unsupported extract type');
    });

    it('throws for unsupported extract type in Thai prompt', () => {
      const agent = makeAgent();
      // @ts-expect-error: intentionally passing invalid extract type
      expect(() => agent.userPrompt({ description: 'x', extract: 'unknown', thai: true })).toThrow(
        'Unsupported extract type',
      );
    });

    it('includes both story and entities when both provided', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        description: 'A robbery.',
        entity: 'Persons: Jane',
        extract: 'person',
      });
      expect(prompt).toContain('Input story:');
      expect(prompt).toContain('Input entities:');
    });

    it('includes only story when no entity provided', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'A robbery.', extract: 'person' });
      expect(prompt).toContain('Input story:');
      expect(prompt).not.toContain('Input entities:');
    });
  });
});
