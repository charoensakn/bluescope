import { describe, expect, it } from 'vitest';
import { BaseAgent, type RunArgs } from './base';

// Minimal concrete implementation for testing abstract BaseAgent methods
class TestAgent extends BaseAgent {
  name() {
    return 'test-v1';
  }

  systemPrompt(_input: RunArgs): string {
    return 'test system prompt';
  }

  userPrompt(_input: RunArgs): string {
    return 'test user prompt';
  }
}

function makeAgent() {
  return new TestAgent('openai', 'gpt-4');
}

describe('BaseAgent', () => {
  describe('name', () => {
    it('returns the agent name', () => {
      expect(makeAgent().name()).toBe('test-v1');
    });
  });

  describe('output', () => {
    it('returns text output by default', () => {
      const agent = makeAgent();
      const out = agent.output({});
      expect(out.name).toBe('text');
    });
  });

  describe('inputDescription', () => {
    it('returns description when provided', () => {
      const agent = makeAgent();
      expect(agent.inputDescription({ description: 'A case' })).toBe('A case');
    });

    it('returns English fallback when no description (thai=false)', () => {
      const agent = makeAgent();
      expect(agent.inputDescription({})).toBe('No description');
    });

    it('returns Thai fallback when no description (thai=true)', () => {
      const agent = makeAgent();
      expect(agent.inputDescription({ thai: true })).toBe('ไม่มีรายละเอียด');
    });
  });

  describe('inputStory', () => {
    it('wraps description in English story template', () => {
      const agent = makeAgent();
      const result = agent.inputStory({ description: 'A robbery occurred.' });
      expect(result).toContain('Input story:');
      expect(result).toContain('--- BEGIN STORY ---');
      expect(result).toContain('A robbery occurred.');
      expect(result).toContain('--- END STORY ---');
    });

    it('wraps description in Thai story template when thai=true', () => {
      const agent = makeAgent();
      const result = agent.inputStory({ description: 'เหตุการณ์', thai: true });
      expect(result).toContain('อินพุตเรื่อง:');
      expect(result).toContain('--- BEGIN STORY ---');
      expect(result).toContain('เหตุการณ์');
    });

    it('returns English "None" message when no description', () => {
      const agent = makeAgent();
      const result = agent.inputStory({});
      expect(result).toBe('Input story: None\n');
    });

    it('returns Thai "None" message when no description and thai=true', () => {
      const agent = makeAgent();
      const result = agent.inputStory({ thai: true });
      expect(result).toBe('อินพุตเรื่อง: ไม่มี\n');
    });
  });

  describe('inputEntities', () => {
    it('wraps entity in English entities template', () => {
      const agent = makeAgent();
      const result = agent.inputEntities({ entity: 'Persons: John Doe' });
      expect(result).toContain('Input entities:');
      expect(result).toContain('--- BEGIN ENTITIES ---');
      expect(result).toContain('Persons: John Doe');
      expect(result).toContain('--- END ENTITIES ---');
    });

    it('wraps entity in Thai entities template when thai=true', () => {
      const agent = makeAgent();
      const result = agent.inputEntities({ entity: 'บุคคล: สมชาย', thai: true });
      expect(result).toContain('อินพุตเอนทิตี:');
      expect(result).toContain('--- BEGIN ENTITIES ---');
      expect(result).toContain('บุคคล: สมชาย');
    });

    it('returns English "None" message when no entity', () => {
      const agent = makeAgent();
      const result = agent.inputEntities({});
      expect(result).toBe('Input entities: None\n');
    });

    it('returns Thai "None" message when no entity and thai=true', () => {
      const agent = makeAgent();
      const result = agent.inputEntities({ thai: true });
      expect(result).toBe('อินพุตเอนทิตี: ไม่มี\n');
    });
  });

  describe('inputBothStoryAndEntities', () => {
    it('combines story and entities when both provided', () => {
      const agent = makeAgent();
      const result = agent.inputBothStoryAndEntities({
        description: 'A robbery.',
        entity: 'Persons: John',
      });
      expect(result).toContain('Input story:');
      expect(result).toContain('Input entities:');
      expect(result).toContain('A robbery.');
      expect(result).toContain('Persons: John');
    });

    it('returns only story section when no entity', () => {
      const agent = makeAgent();
      const result = agent.inputBothStoryAndEntities({ description: 'A theft.' });
      expect(result).toContain('Input story:');
      expect(result).not.toContain('Input entities:');
    });

    it('returns only entities section when no description', () => {
      const agent = makeAgent();
      const result = agent.inputBothStoryAndEntities({ entity: 'Persons: Jane' });
      expect(result).not.toContain('Input story:');
      expect(result).toContain('Input entities:');
    });

    it('returns empty string when neither description nor entity provided', () => {
      const agent = makeAgent();
      const result = agent.inputBothStoryAndEntities({});
      expect(result).toBe('');
    });
  });

  describe('error paths before run', () => {
    it('getReasoningText throws when LLM has not been run', async () => {
      const agent = makeAgent();
      await expect(agent.getReasoningText()).rejects.toThrow('LLM has not been run yet');
    });

    it('getText throws when LLM has not been run', async () => {
      const agent = makeAgent();
      await expect(agent.getText()).rejects.toThrow('LLM has not been run yet');
    });

    it('getOutput throws when LLM has not been run', async () => {
      const agent = makeAgent();
      await expect(agent.getOutput()).rejects.toThrow('LLM has not been run yet');
    });

    it('getUsage throws when LLM has not been run', async () => {
      const agent = makeAgent();
      await expect(agent.getUsage()).rejects.toThrow('LLM has not been run yet');
    });
  });

  describe('getJsonRepair', () => {
    it('returns a JsonRepairAgent with matching configuration', () => {
      const agent = new TestAgent('openai', 'gpt-4', 'http://base', 'key', 1, 0.5, 2000);
      const repair = agent.getJsonRepair();
      expect(repair.providerName).toBe('openai');
      expect(repair.model).toBe('gpt-4');
      expect(repair.baseURL).toBe('http://base');
      expect(repair.apiKey).toBe('key');
      expect(repair.reasoning).toBe(1);
      expect(repair.temperature).toBe(0.5);
      expect(repair.maxOutputTokens).toBe(2000);
    });
  });
});
