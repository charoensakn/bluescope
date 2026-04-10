import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { JsonRepairAgent } from './json_repair';

describe('JsonRepairAgent', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  describe('parseJson - valid input', () => {
    it('returns parsed data when json already matches the schema', async () => {
      const agent = new JsonRepairAgent('openai', 'gpt-4');
      const input = { name: 'Alice', age: 30 };
      const result = await agent.parseJson(input, schema);
      expect(result).toEqual(input);
    });

    it('handles nested schemas', async () => {
      const nestedSchema = z.object({
        results: z.array(
          z.object({
            id: z.string(),
            confidence: z.number(),
          }),
        ),
      });
      const agent = new JsonRepairAgent('openai', 'gpt-4');
      const input = {
        results: [
          { id: 'abc', confidence: 0.9 },
          { id: 'def', confidence: 0.5 },
        ],
      };
      const result = await agent.parseJson(input, nestedSchema);
      expect(result).toEqual(input);
    });

    it('handles empty array in results', async () => {
      const arrSchema = z.object({ results: z.array(z.string()) });
      const agent = new JsonRepairAgent('openai', 'gpt-4');
      const result = await agent.parseJson({ results: [] }, arrSchema);
      expect(result).toEqual({ results: [] });
    });

    it('handles null input that matches nullable schema', async () => {
      const nullSchema = z.object({ value: z.string().nullable() });
      const agent = new JsonRepairAgent('openai', 'gpt-4');
      const result = await agent.parseJson({ value: null }, nullSchema);
      expect(result).toEqual({ value: null });
    });
  });

  describe('parseJson - invalid input (repair path)', () => {
    it('throws when input is invalid and LLM has not been configured (no API call)', async () => {
      const agent = new JsonRepairAgent('openai', 'gpt-4');
      const invalidInput = { name: 123, age: 'not-a-number' };
      // Without a real API key, the LLM call will fail, which means parseJson throws
      await expect(agent.parseJson(invalidInput, schema)).rejects.toThrow();
    });
  });
});
