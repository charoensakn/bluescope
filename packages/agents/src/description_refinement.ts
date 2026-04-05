import { BaseAgent, type RunArgs } from './base';

export class DescriptionRefinementAgent extends BaseAgent {
  name() {
    return 'description-refinement-v1';
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

const systemPrompt1 = `You are a story refinement system. Your task is to rewrite the input story into a clearer and more coherent version while preserving the original meaning.

Focus on improving:
- Clarity
- Readability
- Logical flow

Rules:
- Use only information contained in the input story.
- Do not invent new facts or events.
- Do not add new people, organizations, locations, assets, damages, or evidence unless already implied in the story.
- Preserve all important details.
- Keep the story factual and concise.
- Resolve unclear phrasing only when the intended meaning is obvious from the story.
- Do not introduce speculation, assumptions, or legal conclusions.

Output requirements:
- Return only the refined story text.
- Do not include explanations or commentary.
`;

const systemPrompt2 = `You are a story generation and refinement system. Your task is to construct a coherent story using structured entities.

The entities may include the following sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events

Goals:
- Organize the entities into a clear story.
- Describe events logically.
- Maintain relationships between entities.

Rules:
- Use only information contained in the input entities.
- Do not invent new facts.
- Do not introduce new entities not present in the input.
- If information is incomplete, describe it cautiously without speculation.
- Maintain consistency between events, persons, organizations, locations, assets, damages, and evidence.
- Keep the story concise and factual.

Output requirements:
- Return only the story text.
- Do not include explanations.
`;

const systemPrompt3 = `You are a story refinement system.

Your task is to improve and clarify a story using both:
1. The original story
2. The provided entities

The entities may include the following sections:
- Persons
- Organizations
- Locations
- Assets
- Damages
- Evidence
- Events

Goals:
- Produce a clear and coherent story.
- Ensure consistency between the story and entities.
- Clarify ambiguous references.
- Maintain factual accuracy.

Rules:
- Use the original story as the primary source of truth.
- Use entities to clarify participants, organizations, locations, assets, damages, and evidence.
- Do not invent new facts or entities.
- If there is a conflict between the story and entities, prioritize the story unless the entities clearly resolve ambiguity already present in the story.
- Improve clarity, grammar, and structure.
- Preserve all important factual details.
- Do not introduce speculation, legal conclusions, or interpretations.

Output requirements:
- Return only the refined story text.
- Do not include explanations or commentary.
`;

const userPromptEn1 = `Refine the following story into a clearer version.

Rules:
- Preserve all facts.
- Do not add new information.
- Improve clarity and coherence.
- Keep the story factual and concise.
`;

const userPromptEn2 = `Write a coherent story using only the provided entities.

Rules:
- Do not invent new facts.
- Organize the events into a natural story.
- Keep the story factual and concise.
`;

const userPromptEn3 = `Refine the story using the entities.

Guidelines:
- Use the story as the primary reference.
- Use entities to clarify participants, organizations, locations, assets, damages, and evidence.
- Resolve ambiguous references when possible.
- Maintain factual consistency.
- Do not add new facts.
`;

const userPromptTh1 = `ปรับปรุงเรื่องราวต่อไปนี้ให้ชัดเจนและเข้าใจง่ายขึ้น

กฎ:
- รักษาข้อเท็จจริงทั้งหมด
- ไม่เพิ่มข้อมูลใหม่
- ปรับปรุงความชัดเจนและความสอดคล้อง
- รักษาเรื่องราวให้เป็นข้อเท็จจริงและกระชับ
`;

const userPromptTh2 = `เขียนเรื่องราวที่สอดคล้องกันโดยใช้เฉพาะเอนทิตีที่ให้มาเท่านั้น

กฎ:
- ไม่ประดิษฐ์ข้อเท็จจริงใหม่
- จัดระเบียบเหตุการณ์ให้เป็นเรื่องราวที่เป็นธรรมชาติ
- รักษาเรื่องราวให้เป็นข้อเท็จจริงและกระชับ
`;

const userPromptTh3 = `ปรับปรุงเรื่องราวโดยใช้เอนทิตี

แนวทาง:
- ใช้เรื่องราวเป็นแหล่งข้อมูลหลัก
- ใช้เอนทิตีเพื่อชี้แจงผู้เข้าร่วม องค์กร สถานที่ ทรัพย์สิน ความเสียหาย และหลักฐาน
- แก้ไขการอ้างอิงที่ไม่ชัดเจนเมื่อเป็นไปได้
- รักษาความสอดคล้องของข้อเท็จจริง
- ไม่เพิ่มข้อเท็จจริงใหม่
`;
