import { describe, expect, it } from 'vitest';
import { SummaryAgent } from './summary';

describe('SummaryAgent', () => {
  function makeAgent() {
    return new SummaryAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns summary-v1', () => {
      expect(makeAgent().name()).toBe('summary-v1');
    });
  });

  describe('systemPrompt', () => {
    it('returns a non-empty system prompt', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains summarization instructions', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(prompt).toContain('summariz');
    });

    it('specifies one paragraph output', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(prompt).toContain('one paragraph');
    });
  });

  describe('userPrompt', () => {
    it('includes English instruction when thai is falsy', () => {
      const prompt = makeAgent().userPrompt({ description: 'A fraud case.' });
      expect(prompt).toContain('I will provide a story');
      expect(prompt).toContain('A fraud case.');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({ description: 'คดีฉ้อโกง', thai: true });
      expect(prompt).toContain('ฉันจะให้เรื่องหนึ่งแก่คุณ');
      expect(prompt).toContain('คดีฉ้อโกง');
    });

    it('uses English fallback when no description provided', () => {
      const prompt = makeAgent().userPrompt({});
      expect(prompt).toContain('No description');
    });

    it('uses Thai fallback when thai=true and no description', () => {
      const prompt = makeAgent().userPrompt({ thai: true });
      expect(prompt).toContain('ไม่มีรายละเอียด');
    });
  });
});
