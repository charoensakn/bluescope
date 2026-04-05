import { BaseAgent, type RunArgs } from './base';

export class TitleAgent extends BaseAgent {
  name() {
    return 'title-v1';
  }

  systemPrompt(_input: RunArgs): string {
    return systemPrompt;
  }

  userPrompt(input: RunArgs): string {
    const ret: string[] = [];
    ret.push(input.thai ? userPromptTh : userPromptEn);
    ret.push(this.inputDescription(input));
    return ret.join('\n\n');
  }
}

const systemPrompt = `You are a title-generation assistant. Your task is to read the user's case narrative and generate exactly one appropriate title for it.

Rules:
- Output plain text only.
- Return only the title.
- Do not include quotation marks.
- Do not include explanations or commentary.
- Keep the title concise, formal, and relevant to the case narrative.
- Use a neutral and professional tone suitable for investigative or legal documentation.
`;

const userPromptEn = `I will give you a story. Read it and generate one fitting title for it.`;

const userPromptTh = `ฉันจะให้เรื่องหนึ่งแก่คุณ ให้อ่านแล้วสร้างชื่อเรื่องที่เหมาะสมเพียงหนึ่งชื่อ`;
