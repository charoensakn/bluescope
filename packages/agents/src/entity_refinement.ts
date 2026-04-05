import { BaseAgent, type RunArgs } from './base';

export class EntityRefinementAgent extends BaseAgent {
  name() {
    return 'entity-refinement-v1';
  }

  systemPrompt(input: RunArgs): string {
    if (input.description && input.entity) {
      return systemPrompt3;
    } else if (input.description) {
      return systemPrompt1;
    } else if (input.entity) {
      return systemPrompt2;
    } else {
      throw new Error('At least one of description or entity must be provided');
    }
  }

  userPrompt(input: RunArgs): string {
    const ret: string[] = [];
    if (input.description && input.entity) {
      ret.push(input.thai ? userPromptTh3 : userPromptEn3);
      ret.push(this.inputBothStoryAndEntities(input));
    } else if (input.description) {
      ret.push(input.thai ? userPromptTh1 : userPromptEn1);
      ret.push(this.inputStory(input));
    } else if (input.entity) {
      ret.push(input.thai ? userPromptTh2 : userPromptEn2);
      ret.push(this.inputEntities(input));
    }
    return ret.join('\n');
  }
}

const systemPrompt1 = `You are an entity extraction system. Your task is to analyze the story and produce structured information.

The output must contain the following entity groups as Markdown sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events

General rules:
- Use only information grounded in the input.
- Do not invent new facts.
- Prefer fewer, clearer entities instead of fragmented duplicates.
- Merge duplicates when appropriate.
- Maintain consistent references across entities.
- If information is uncertain, write "unknown" or add a short note.
- Keep descriptions concise.

Output requirements:
- Organize entities using Markdown sections.
- Do not include explanations.
`;

const systemPrompt2 = `You are an entity refinement system. Your task is to analyze entity information and produce clean, consistent entities.

The output must contain the following entity groups as Markdown sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events

General rules:
- Use only information grounded in the input.
- Do not invent new facts.
- Prefer fewer, clearer entities instead of fragmented duplicates.
- Merge duplicates when appropriate.
- Maintain consistent references across entities.
- If information is uncertain, write "unknown" or add a short note.
- Keep descriptions concise.

Output requirements:
- Organize entities using Markdown sections.
- Do not include explanations.
`;

const systemPrompt3 = `You are an entity refinement system. Your task is to analyze the story and entity information and produce structured entities.

The output must contain the following entity groups as Markdown sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events

General rules:
- Use the story as the primary source of truth.
- Use only information grounded in the input.
- Do not invent new facts.
- Prefer fewer, clearer entities instead of fragmented duplicates.
- Merge duplicates when appropriate.
- Maintain consistent references across entities.
- If information is uncertain, write "unknown" or add a short note.
- Keep descriptions concise.

Output requirements:
- Organize entities using Markdown sections.
- Do not include explanations.
`;

const userPromptEn1 = `Extract and organize entities from the story.

Organize the result into the following Markdown sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events

Guidelines:
- Identify individuals and organizations.
- Identify actions and incidents.
- Identify places.
- Identify property or assets.
- Identify damages.
- Identify evidence supporting events.
`;

const userPromptEn2 = `Refine and normalize the following entities.

Tasks:
- Merge duplicate entities.
- Normalize entity descriptions.
- Improve consistency across references.
- Organize entities into the correct groups.

Return entities using Markdown sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events
`;

const userPromptEn3 = `Refine the entities using the story as the primary reference.

Tasks:
- Correct entities that conflict with the story.
- Add missing entities supported by the story.
- Merge duplicates.
- Improve consistency across entities.
- Ensure relationships between events, persons, organizations, locations, assets, damages, and evidence.

Return entities using Markdown sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events
`;

const userPromptTh1 = `สกัดและจัดระเบียบข้อมูลจากเรื่องราว

จัดผลลัพธ์เป็นส่วนต่าง ๆ ดังนี้:
- บุคคล
- องค์กร
- สถานที่
- ทรัพย์สิน
- ความเสียหาย
- หลักฐาน
- เหตุการณ์

แนวทาง:
- ระบุบุคคลและองค์กร
- ระบุการกระทำและเหตุการณ์
- ระบุสถานที่
- ระบุทรัพย์สินหรือสินทรัพย์
- ระบุความเสียหาย
- ระบุหลักฐานที่สนับสนุนเหตุการณ์
`;

const userPromptTh2 = `ปรับปรุงและทำให้ข้อมูลที่ให้มาชัดเจนขึ้น

งานที่ต้องทำ:
- รวมข้อมูลที่ซ้ำซ้อน
- ทำให้คำอธิบายของข้อมูลเป็นมาตรฐาน
- ปรับปรุงความสอดคล้องในการอ้างอิง
- จัดระเบียบข้อมูลให้ถูกต้อง

ส่งกลับข้อมูลเป็น Markdown โดยมีส่วนต่าง ๆ ดังนี้:
- บุคคล
- องค์กร
- สถานที่
- ทรัพย์สิน
- ความเสียหาย
- หลักฐาน
- เหตุการณ์
`;

const userPromptTh3 = `ปรับปรุงข้อมูลโดยใช้เรื่องราวเป็นแหล่งข้อมูลหลัก

งานที่ต้องทำ:
- แก้ไขข้อมูลที่ขัดแย้งกับเรื่องราว
- เพิ่มข้อมูลที่ขาดหายไปซึ่งสนับสนุนโดยเรื่องราว
- รวมข้อมูลที่ซ้ำซ้อน
- ปรับปรุงความสอดคล้องของข้อมูล
- ทำให้แน่ใจว่าความสัมพันธ์ระหว่างเหตุการณ์ บุคคล องค์กร สถานที่ ทรัพย์สิน ความเสียหาย และหลักฐานถูกต้อง

ส่งกลับข้อมูลเป็น Markdown โดยมีส่วนต่าง ๆ ดังนี้:
- บุคคล
- องค์กร
- สถานที่
- ทรัพย์สิน
- ความเสียหาย
- หลักฐาน
- เหตุการณ์
`;
