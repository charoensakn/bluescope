import { describe, expect, it, vi } from 'vitest';
import { AdvisoryAgent } from './advisory';

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
        description: 'Intentional killing',
        name: '01-homicide',
        skill: '# Homicide Instructions\n\nAnalyze the case carefully.',
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
        skill: '# Premeditated Murder Instructions\n\nLook for evidence of planning.',
        reference: '',
      },
      {
        skillId: '03-arson',
        skillNameEn: 'Arson',
        skillNameTh: 'วางเพลิง',
        categoryId: 'หมวด-2',
        categoryNameEn: 'Property Crimes',
        categoryNameTh: 'อาชญากรรมทรัพย์สิน',
        description: 'Deliberate fire-setting',
        name: '03-arson',
        skill: '',
        reference: '',
      },
    ];
  }),
}));

describe('AdvisoryAgent', () => {
  function makeAgent() {
    return new AdvisoryAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns advisory-v1', () => {
      expect(makeAgent().name()).toBe('advisory-v1');
    });
  });

  describe('systemPrompt', () => {
    it('throws when no skillsPath provided', () => {
      const agent = makeAgent();
      expect(() => agent.systemPrompt({})).toThrow('No skills found at the provided path');
    });

    it('throws when skill not found for the given skillId', () => {
      const agent = makeAgent();
      expect(() => agent.systemPrompt({ skillsPath: '/some/path', skillId: 'non-existent' })).toThrow(
        'Skill "non-existent" not found',
      );
    });

    it('throws when skill definition is empty', () => {
      const agent = makeAgent();
      expect(() => agent.systemPrompt({ skillsPath: '/some/path', skillId: '03-arson' })).toThrow(
        'does not have a skill definition',
      );
    });

    it('returns the skill instructions for a valid skillId', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ skillsPath: '/some/path', skillId: '01-homicide' });
      expect(prompt).toBe('# Homicide Instructions\n\nAnalyze the case carefully.');
    });

    it('returns the correct instructions for a different skillId', () => {
      const agent = makeAgent();
      const prompt = agent.systemPrompt({ skillsPath: '/some/path', skillId: '02-premeditated-murder' });
      expect(prompt).toContain('Look for evidence of planning.');
    });
  });

  describe('userPrompt', () => {
    it('returns description when provided', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ description: 'A victim was found.' });
      expect(prompt).toBe('A victim was found.');
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
