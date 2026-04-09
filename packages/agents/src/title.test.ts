import { describe, expect, it } from 'vitest';
import { TitleAgent } from './title';

describe('TitleAgent', () => {
  function makeAgent() {
    return new TitleAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns title-v1', () => {
      expect(makeAgent().name()).toBe('title-v1');
    });
  });

  describe('systemPrompt', () => {
    it('returns a non-empty system prompt', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains title generation instructions', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(prompt).toContain('title');
    });

    it('contains rule about plain text output', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(prompt).toContain('plain text');
    });
  });

  describe('userPrompt', () => {
    it('includes English instruction when thai is falsy', () => {
      const prompt = makeAgent().userPrompt({ description: 'A robbery case.' });
      expect(prompt).toContain('I will give you a story');
      expect(prompt).toContain('A robbery case.');
    });

    it('includes Thai instruction when thai=true', () => {
      const prompt = makeAgent().userPrompt({ description: 'คดีปล้น', thai: true });
      expect(prompt).toContain('ฉันจะให้เรื่องหนึ่งแก่คุณ');
      expect(prompt).toContain('คดีปล้น');
    });

    it('uses fallback when no description provided', () => {
      const prompt = makeAgent().userPrompt({});
      expect(prompt).toContain('No description');
    });

    it('uses Thai fallback when thai=true and no description', () => {
      const prompt = makeAgent().userPrompt({ thai: true });
      expect(prompt).toContain('ไม่มีรายละเอียด');
    });
  });
});
