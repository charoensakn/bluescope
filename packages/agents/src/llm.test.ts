import { describe, expect, it } from 'vitest';
import { LLM } from './llm';

describe('LLM', () => {
  describe('getReasoning', () => {
    it('returns undefined when reasoning is negative', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1).getReasoning()).toBeUndefined();
    });

    it('returns 0 when reasoning is 0', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, 0).getReasoning()).toBe(0);
    });

    it('returns the value when in range [1,3]', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, 1).getReasoning()).toBe(1);
      expect(new LLM('openai', 'gpt-4', undefined, undefined, 2).getReasoning()).toBe(2);
      expect(new LLM('openai', 'gpt-4', undefined, undefined, 3).getReasoning()).toBe(3);
    });

    it('clamps reasoning to 3 when above 3', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, 5).getReasoning()).toBe(3);
      expect(new LLM('openai', 'gpt-4', undefined, undefined, 10).getReasoning()).toBe(3);
    });
  });

  describe('getTemperature', () => {
    it('returns undefined when temperature is negative', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, -1).getTemperature()).toBeUndefined();
    });

    it('returns 0 when temperature is 0', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, 0).getTemperature()).toBe(0);
    });

    it('returns the value when in range (0,1]', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, 0.5).getTemperature()).toBe(0.5);
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, 1).getTemperature()).toBe(1);
    });

    it('clamps temperature to 1 when above 1', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, 1.5).getTemperature()).toBe(1);
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, 2).getTemperature()).toBe(1);
    });
  });

  describe('getMaxOutputTokens', () => {
    it('returns undefined when maxOutputTokens is negative', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, -1, -1).getMaxOutputTokens()).toBeUndefined();
    });

    it('returns undefined when maxOutputTokens is 0', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, -1, 0).getMaxOutputTokens()).toBeUndefined();
    });

    it('returns the value when maxOutputTokens is at least 1', () => {
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, -1, 1).getMaxOutputTokens()).toBe(1);
      expect(new LLM('openai', 'gpt-4', undefined, undefined, -1, -1, 4096).getMaxOutputTokens()).toBe(4096);
    });
  });

  describe('createProvider', () => {
    it('throws for unsupported provider name', () => {
      const llm = new LLM('unsupported-provider', 'model');
      expect(() => llm.createProvider()).toThrow('Unsupported provider: unsupported-provider');
    });

    it('throws when compat provider has no baseURL', () => {
      const llm = new LLM('compat', 'model');
      expect(() => llm.createProvider()).toThrow('Base URL is required for OpenAI-Compatible API');
    });

    it('throws when azure provider has no baseURL', () => {
      const llm = new LLM('azure', 'model');
      expect(() => llm.createProvider()).toThrow('Base URL is required for Azure OpenAI');
    });

    it('creates openai provider without throwing', () => {
      const llm = new LLM('openai', 'gpt-4', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates anthropic provider without throwing', () => {
      const llm = new LLM('anthropic', 'claude-3', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates google provider without throwing', () => {
      const llm = new LLM('google', 'gemini-pro', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates groq provider without throwing', () => {
      const llm = new LLM('groq', 'llama3', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates deepseek provider without throwing', () => {
      const llm = new LLM('deepseek', 'deepseek-chat', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates mistral provider without throwing', () => {
      const llm = new LLM('mistral', 'mistral-large', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates cohere provider without throwing', () => {
      const llm = new LLM('cohere', 'command', undefined, 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });

    it('creates compat provider when baseURL is provided', () => {
      const llm = new LLM('compat', 'model', 'http://localhost:11434/v1', 'key');
      expect(() => llm.createProvider()).not.toThrow();
    });
  });

  describe('double-run guard', () => {
    it('generateText throws on second call', async () => {
      const llm = new LLM('openai', 'gpt-4', undefined, 'key');
      // Manually set isRun to simulate a previous run without actual API call
      llm.isRun = true;
      await expect(
        llm.generateText({ prompt: 'hello' }),
      ).rejects.toThrow('Agent is already run');
    });

    it('streamText throws on second call', () => {
      const llm = new LLM('openai', 'gpt-4', undefined, 'key');
      llm.isRun = true;
      expect(() => llm.streamText({ prompt: 'hello' })).toThrow('Agent is already run');
    });
  });
});
