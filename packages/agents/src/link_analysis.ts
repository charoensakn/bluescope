import { Output } from 'ai';
import { z } from 'zod';
import { BaseAgent, type RunArgs } from './base';

export class LinkAnalysisAgent extends BaseAgent {
  private _schema: z.ZodType | null = null;

  name(): string {
    return 'link-analysis-v1';
  }

  output(_input: RunArgs): Output.Output {
    this._schema = z.object({
      results: z.array(
        z.object({
          source_id: z.string(),
          target_id: z.string(),
          relation: z.string(),
          confidence: z.number(),
        }),
      ),
    });
    return Output.json();
  }

  systemPrompt(_input: RunArgs): string {
    return systemPrompt;
  }

  userPrompt(input: RunArgs): string {
    const ret: string[] = [];
    ret.push(input.thai ? userPromptTh : userPromptEn);
    ret.push(this.inputBothStoryAndEntities(input));
    return ret.join('\n\n');
  }

  async getOutput(): Promise<unknown> {
    const json = await super.getOutput();

    const results = await this.getJsonRepair().parseJson(json, this._schema);
    if (typeof results === 'object' && 'results' in results && Array.isArray(results.results)) {
      return results.results;
    }
    return [];
  }
}

const systemPrompt = `You are an expert system for analyzing the story and structured entities. Your task is to generate links between entities based on the story and the entity objects.

Your output must be **only** a single JSON object with the following structure:

{
  "results": [
    {
      "source_id": string,
      "target_id": string,
      "relation": string,
      "confidence": number
    }
  ]
}

Rules:
- Use information grounded in the story and the provided entity objects.
- A link must represent a meaningful relationship (e.g., involvement, ownership, location, participation, evidence connection, harm, interaction).
- You may infer relationships only when they are clearly supported by the story or entity data.
- Keep descriptions concise and factual.
- Use consistent references across all links.
- Do not invent entities or IDs.
- Do not add fields not defined in the schema.
- If no links exist, return an empty results array.
`;

const userPromptEn = `Using the story and entities below, generate all meaningful links between the entities.`;

const userPromptTh = `โปรดใช้ข้อมูลจาก **เรื่องราว** และ **เอนทิตี** ด้านล่าง เพื่อสร้างความเชื่อมโยงระหว่างเอนทิตีทั้งหมดที่มีความเกี่ยวข้องกัน`;
