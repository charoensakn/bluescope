import { BaseAgent, type RunArgs } from './base';
import { loadSkills } from './utils';

export class AdvisoryAgent extends BaseAgent {
  name() {
    return 'advisory-v1';
  }

  systemPrompt(input: RunArgs): string {
    const skills = input.skillsPath ? loadSkills(input.skillsPath) : [];
    if (skills.length === 0) {
      throw new Error('No skills found at the provided path');
    }
    const selectedSkill = skills.find((skill) => skill.skillId === input.skillId);
    if (!selectedSkill) {
      throw new Error(`Skill "${input.skillId}" not found in the provided skills path`);
    }
    if (!selectedSkill.skill) {
      throw new Error(`Skill "${input.skillId}" does not have a skill definition`);
    }
    return selectedSkill.skill;
  }

  userPrompt(input: RunArgs): string {
    return this.inputDescription(input);
  }
}
