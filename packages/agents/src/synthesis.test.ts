import { describe, expect, it, vi } from 'vitest';
import { SynthesisAgent } from './synthesis';

const mockSkills = [
  {
    skillId: '01-homicide',
    skillNameEn: 'Homicide',
    skillNameTh: 'คดีฆาตกรรม',
    categoryId: 'หมวด-1',
    categoryNameEn: 'Violent Crimes',
    categoryNameTh: 'อาชญากรรมรุนแรง',
    description: 'Intentional killing',
    name: '01-homicide',
    skill: '# Homicide Instructions',
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
    skill: '# Premeditated Murder',
    reference: '',
  },
];

vi.mock('./utils', () => ({
  loadSkills: vi.fn(() => mockSkills),
}));

describe('SynthesisAgent', () => {
  function makeAgent() {
    return new SynthesisAgent('openai', 'gpt-4');
  }

  describe('name', () => {
    it('returns synthesis-v1', () => {
      expect(makeAgent().name()).toBe('synthesis-v1');
    });
  });

  describe('systemPrompt', () => {
    it('returns a non-empty synthesis prompt', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('contains synthesis instructions', () => {
      const prompt = makeAgent().systemPrompt({});
      expect(prompt).toContain('synthesis');
      expect(prompt).toContain('weights');
    });
  });

  describe('userPrompt', () => {
    it('throws when no skillsPath provided', () => {
      const agent = makeAgent();
      expect(() => agent.userPrompt({ suggestions: [] })).toThrow('Skills path is required');
    });

    it('returns English "no suggestions" message when suggestions array is empty', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ skillsPath: '/path', suggestions: [] });
      expect(prompt).toBe('No suggestions provided');
    });

    it('returns Thai "no suggestions" message when thai=true and no suggestions', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ skillsPath: '/path', suggestions: [], thai: true });
      expect(prompt).toBe('ไม่มีคำแนะนำ');
    });

    it('returns English "no suggestions" when suggestions not provided', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({ skillsPath: '/path' });
      expect(prompt).toBe('No suggestions provided');
    });

    it('includes skill names and advisory text in English prompt', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        skillsPath: '/path',
        suggestions: [
          { name: '01-homicide', weight: 0.8, text: 'Homicide advisory details.' },
          { name: '02-premeditated-murder', weight: 0.2, text: 'Premeditated advisory details.' },
        ],
      });
      expect(prompt).toContain('Homicide');
      expect(prompt).toContain('Premeditated Murder');
      expect(prompt).toContain('Homicide advisory details.');
      expect(prompt).toContain('Premeditated advisory details.');
      expect(prompt).toContain('Advisor weights:');
    });

    it('includes skill names in Thai prompt when thai=true', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        skillsPath: '/path',
        thai: true,
        suggestions: [
          { name: '01-homicide', weight: 1, text: 'คำแนะนำ' },
        ],
      });
      expect(prompt).toContain('คดีฆาตกรรม');
      expect(prompt).toContain('คำแนะนำ');
    });

    it('normalizes weights proportionally', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        skillsPath: '/path',
        suggestions: [
          { name: '01-homicide', weight: 1, text: 'Advisory A' },
          { name: '02-premeditated-murder', weight: 1, text: 'Advisory B' },
        ],
      });
      // Equal weights should each be 0.50
      expect(prompt).toContain('0.50');
    });

    it('falls back to raw suggestion name when skill not found in skills list', () => {
      const agent = makeAgent();
      const prompt = agent.userPrompt({
        skillsPath: '/path',
        suggestions: [
          { name: 'unknown-skill', weight: 1, text: 'Some advisory' },
        ],
      });
      // Should use the raw name since skill lookup fails
      expect(prompt).toContain('unknown-skill');
    });
  });
});
