import { Output } from 'ai';
import { z } from 'zod';
import { BaseAgent, type RunArgs } from './base';

export class LinkAnalysisAgent extends BaseAgent {
  name(): string {
    return 'link-analysis-v1';
  }

  output(_input: RunArgs): Output.Output {
    return Output.array({
      element: z.object({
        source_id: z.string(),
        target_id: z.string(),
        relation: z.string(),
        confidence: z.number(),
      }),
    });
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
}

const systemPrompt = `You are an expert system for analyzing the story and structured entities. Your task is to generate a JSON array of links between entities based on the story and the entity objects.

Each link must follow this exact schema:

{
  "source_id": string,
  "target_id": string,
  "relation": string,
  "confidence": number
}

Rules:
- Use information grounded in the story and the provided entity objects.
- A link must represent a meaningful relationship (e.g., involvement, ownership, location, participation, evidence connection, harm, interaction).
- You may infer relationships only when they are clearly supported by the story or entity data.
- Keep descriptions concise and factual.
- Use consistent references across all links.
- Do not invent entities or IDs.
- Do not add fields not defined in the schema.
- If no links exist, return an empty JSON array.
- Output JSON array only, with no explanation.
`;

const userPromptEn = `Using the story and entities below, generate all meaningful links between the entities.`;

const userPromptTh = `โปรดใช้ข้อมูลจาก **เรื่องราว** และ **เอนทิตี** ด้านล่าง เพื่อสร้างความเชื่อมโยงระหว่างเอนทิตีทั้งหมดที่มีความเกี่ยวข้องกัน`;
