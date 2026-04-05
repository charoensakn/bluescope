import { Output } from 'ai';
import { z } from 'zod';
import { BaseAgent, type RunArgs } from './base';
import { loadSkills } from './utils';

export class ClassificationAgent extends BaseAgent {
  private _skillMap = new Map<string, string>();

  name() {
    return 'classification-v1';
  }

  output(_input: RunArgs): Output.Output {
    return Output.array({
      element: z.object({
        id: z.string(),
        reason: z.string(),
        confidence: z.number(),
      }),
    });
  }

  systemPrompt(input: RunArgs): string {
    const skills = input.skillsPath ? loadSkills(input.skillsPath) : [];
    if (skills.length === 0) {
      throw new Error('No skills found at the provided path');
    }
    const taxonomy = skills.map((skill) => {
      const id = skill.skillId.split('-')[0];
      this._skillMap.set(id, skill.skillId);
      return {
        id,
        name: input.thai ? skill.skillNameTh : skill.skillNameEn,
        description: skill.description,
      };
    });
    return systemPrompt(JSON.stringify(taxonomy));
  }

  userPrompt(input: RunArgs): string {
    return this.inputDescription(input);
  }

  getOutput(): unknown {
    const output = super.getOutput();
    if (Array.isArray(output)) {
      return output.map((item) => ({
        id: this._skillMap.get(item.id) || item.id,
        reason: item.reason,
        confidence: item.confidence,
      }));
    }
    return output;
  }
}

const systemPrompt = (
  taxonomy: string,
) => `You are an expert system for **multi-label criminal case classification**. Your task is to analyze the **user input** and determine which categories from the taxonomy apply.

Below is the taxonomy of case categories in JSON format:

${taxonomy}

---

## Output Requirements

Your output must be **only** a JSON array. Each element must follow this schema:

{
  "id": "string",
  "reason": "string",
  "confidence": number
}

## Classification Rules
- The user input may match **multiple** categories.
- Evaluate **each category independently**.
- Include **only** categories for which the model has **sufficient confidence**.
- Do **not** invent new categories or IDs.
- The **reason** must be a **concise, evidence-based explanation** grounded in the user input.  
- The **confidence** must be a number between **0 and 1**, representing the model's confidence that the input belongs to this category.  
- Output **only** the JSON array—no additional commentary, text, or formatting.
`;
