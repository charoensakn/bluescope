import { describe, expect, it, vi } from 'vitest';
import { ClassificationAgent } from './classification';

vi.mock('./utils', () => ({
  loadSkills: vi.fn((path: string) => {
    if (!path) return [];
    return [
      {
        skillId: '01-homicide',
        skillNameEn: 'Homicide',
        skillNameTh: 'คดีฆาตกรรม',
        categoryId: 'หมวด-1',
        categoryNameEn: 'Violent Crimes',
        categoryNameTh: 'อาชญากรรมรุนแรง',
        description: 'Intentional killing of a person',
        name: '01-homicide',
        skill: '# Homicide Instructions\n...',
        reference: '',
      },
      {
        skillId: '02-premeditated-murder',
        skillNameEn: 'Premeditated Murder',
        skillNameTh: 'ฆ่าคนตายโดยเจตนา',
        categoryId: 'หมวด-1',
        categoryNameEn: 'Violent Crimes',
        categoryNameTh: 'อาชญากรรมรุนแรง',
        description: 'Murder with prior planning',
        name: '02-premeditated-murder',
        skill: '# Premeditated Murder Instructions\n...',
        reference: '',
      },
    ];
  }),
}));

describe('ClassificationAgent', () => {
  function makeAgent() {
    return new ClassificationAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns classification-v1', () => {
      expect(makeAgent().name()).toBe('classification-v1');
    });
  });

  describe('output', () => {
    it('returns JSON output', () => {
      const out = makeAgent().output({});
      expect(out.name).toBe('json');
    });
  });

  describe('systemPrompt', () => {
    it('throws when no skillsPath provided', () => {
      const agent = makeAgent();
      expect(() => agent.systemPrompt({})).toThrow('No skills found at the provided path');
    });

    it('builds taxonomy from skills and includes it in prompt', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ skillsPath: '/some/path' });
      expect(prompt).toContain('Homicide');
      expect(prompt).toContain('classification');
    });

    it('uses Thai skill names when thai=true', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ skillsPath: '/some/path', thai: true });
      expect(prompt).toContain('คดีฆาตกรรม');
    });

    it('uses English skill names when thai is falsy', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ skillsPath: '/some/path', thai: false });
      expect(prompt).toContain('Homicide');
    });

    it('includes skill description in taxonomy', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ skillsPath: '/some/path' });
      expect(prompt).toContain('Intentional killing');
    });
  });

  describe('userPrompt', () => {
    it('returns description when provided', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'A murder case.' });
      expect(prompt).toBe('A murder case.');
    });

    it('returns English fallback when no description', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({});
      expect(prompt).toBe('No description');
    });

    it('returns Thai fallback when thai=true and no description', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ thai: true });
      expect(prompt).toBe('ไม่มีรายละเอียด');
    });
  });
});
