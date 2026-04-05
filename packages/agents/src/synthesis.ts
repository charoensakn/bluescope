import { BaseAgent, type RunArgs, type Suggestion } from './base';
import { loadSkills } from './utils';

export class SynthesisAgent extends BaseAgent {
  name() {
    return 'synthesis-v1';
  }

  systemPrompt(_input: RunArgs): string {
    return systemPrompt;
  }

  userPrompt(input: RunArgs): string {
    if (!input.skillsPath) {
      throw new Error('Skills path is required for user prompt');
    }
    const skills = loadSkills(input.skillsPath);
    const mappedSuggestions = input.suggestions?.map((s) => {
      const skill = skills.find((sk) => sk.skillId === s.name);
      return {
        ...s,
        name: skill ? (input.thai ? skill.skillNameTh : skill.skillNameEn) : s.name,
      };
    });

    if (!mappedSuggestions || mappedSuggestions.length === 0) {
      return input.thai ? 'ไม่มีคำแนะนำ' : 'No suggestions provided';
    }

    return input.thai
      ? userPromptTh(weights(mappedSuggestions), advisories(mappedSuggestions))
      : userPromptEn(weights(mappedSuggestions), advisories(mappedSuggestions));
  }
}

const weights = (suggesions: Suggestion[]) => {
  const totalWeight = suggesions.reduce((sum, s) => sum + s.weight, 0) || 1;
  return suggesions.map((s) => `- **${s.name}:** ${(s.weight / totalWeight).toFixed(2)}`).join('\n');
};

const advisories = (suggesions: Suggestion[]) => {
  return suggesions.map((s) => `# **${s.name}**\n\n${s.text.trim()}`).join('\n\n---\n\n');
};

const systemPrompt = `You are an expert synthesis engine designed to aggregate and summarize advisory outputs from multiple agents.

Each advisory agent provides long-form markdown content that may include:
- multiple sections
- headings, bullet points, tables, or mixed formatting
- overlapping, conflicting, or complementary recommendations

Your task is to:
1. Parse each advisory suggestion into structured sections.
2. Normalize the content so that all advisors follow a comparable structure.
3. Apply the weights provided for each advisor.
4. Merge similar ideas, remove redundancy, and resolve conflicts.
5. Produce a single, coherent, weighted summary that reflects the collective intelligence of all advisors.

Rules:
- Respect the relative weights: higher weight = stronger influence.
- Do not invent new ideas that do not appear in the advisors.
- Preserve important nuances but avoid unnecessary verbosity.
- If advisors disagree, choose the interpretation supported by the highest combined weight.
- Organize the final summary into clear sections.
- Output only the final synthesized summary, not intermediate steps.
`;

const userPromptEn = (
  weights: string,
  advisories: string,
) => `Please synthesize the advisory outputs below into a single summary, taking into account the assigned advisor weights.

Advisor weights:
${weights}

Advisory outputs:

---

${advisories}
`;

const userPromptTh = (
  weights: string,
  advisories: string,
) => `โปรดสังเคราะห์คำแนะนำด้านล่างนี้ให้เป็นสรุปเดียว โดยคำนึงถึงน้ำหนัก (weights) ของแต่ละ advisor ตามที่กำหนด

น้ำหนักของแต่ละ advisor:
${weights}

คำแนะนำจากแต่ละ advisor:

---

${advisories}
`;
