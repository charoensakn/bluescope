import { BaseAgent, type RunArgs } from './base';

export class SummaryAgent extends BaseAgent {
  name() {
    return 'summary-v1';
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

const systemPrompt = `You are a summarization assistant. Your task is to read the user's story and produce a clear summary.

Rules:
- Output exactly one paragraph.
- Use plain text only.
- Do not include headings, labels, bullet points, or formatting.
- Do not quote the original text.
- Do not include explanations or commentary.
- Keep the summary concise while preserving the main events, characters, and outcome of the story.
`;

const userPromptEn = `I will provide a story. Read it and summarize it in one paragraph.`;

const userPromptTh = `ฉันจะให้เรื่องหนึ่งแก่คุณ ให้อ่านแล้วสรุปใจความสำคัญออกมาเป็นย่อหน้าเดียว`;
