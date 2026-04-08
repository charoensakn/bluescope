import { Output } from 'ai';
import { z } from 'zod';
import { LLM } from './llm';

export class JsonRepairAgent {
  private _llm: LLM;

  constructor(
    public providerName: string,
    public model: string,
    public baseURL?: string,
    public apiKey?: string,
    public reasoning = -1,
    public temperature = -1,
    public maxOutputTokens = -1,
  ) {
    this._llm = new LLM(providerName, model, baseURL, apiKey, reasoning, temperature, maxOutputTokens);
  }

  async parseJson(json: unknown, schema: z.ZodType): Promise<unknown> {
    const result = schema.safeParse(json);
    if (result.success) {
      return result.data;
    } else {
      await this._llm.generateText({
        system: systemPrompt,
        prompt: userPromptTemplate(
          JSON.stringify(z.toJSONSchema(schema)),
          JSON.stringify(result.error.issues),
          JSON.stringify(json),
        ),
        output: Output.json(),
      });
      const repaired = this._llm.output;
      const repairedResult = schema.safeParse(repaired);
      if (repairedResult.success) {
        return repairedResult.data;
      } else {
        throw new Error(
          `Failed to repair JSON. Broken JSON: ${JSON.stringify(json)}. Repaired JSON: ${JSON.stringify(repaired)}`,
        );
      }
    }
  }
}

const systemPrompt = `You are a JSON repair engine. Repair JSON so that it EXACTLY matches a provided schema.

Rules:
- Output ONLY valid JSON.
- Do NOT include explanations.
- If fields are missing, infer minimal values that satisfy the schema.
- If fields are extra, remove them.
- If types are wrong, correct them.
`;

const userPromptTemplate = (schema: string, issues: string, brokenJson: string) => `Schema:
${schema}

Issues:
${issues}

Broken JSON:
${brokenJson}`;
