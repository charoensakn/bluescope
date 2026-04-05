import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSkills } from './utils';

const skillsRoot = resolve(__dirname, '../../skills');
const homicideDir = join(skillsRoot, '01-homicide');
const homicideReferencePath = join(homicideDir, 'references', 'doc.md');

function countSkillFiles(rootPath: string): number {
  let count = 0;

  for (const entry of readdirSync(rootPath, { withFileTypes: true })) {
    const fullPath = join(rootPath, entry.name);

    if (entry.isDirectory()) {
      count += countSkillFiles(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name === 'SKILL.md') {
      count += 1;
    }
  }

  return count;
}

describe('loadSkills', () => {
  it('loads every skill from the real skills package', () => {
    const skills = loadSkills(skillsRoot);

    expect(skills.length).toBe(countSkillFiles(skillsRoot));
    expect(skills.length).toBeGreaterThan(0);
  });

  it('parses the homicide skill frontmatter and body', () => {
    const skills = loadSkills(skillsRoot);
    const homicide = skills.find((skill) => skill.skillId === '01-homicide');

    expect(homicide).toBeDefined();
    expect(homicide?.name).toBe('01-homicide');
    expect(homicide?.categoryId).toBe('หมวด-1');
    expect(homicide?.categoryNameEn).toBe('Homicide & Violent Crimes');
    expect(homicide?.skillNameEn).toBe('Homicide');
    expect(homicide?.description).toContain('เจตนา');
    expect(homicide?.skill.startsWith('# Instructions')).toBe(true);
  });

  it('loads reference documents when present', () => {
    const skills = loadSkills(skillsRoot);
    const homicide = skills.find((skill) => skill.skillId === '01-homicide');
    const expectedReference = readFileSync(homicideReferencePath, 'utf8');

    expect(homicide).toBeDefined();
    expect(homicide?.reference).toBe(expectedReference);
  });

  it('returns the cached result for the same path', () => {
    const first = loadSkills(skillsRoot);
    const second = loadSkills(skillsRoot);

    expect(first).toBe(second);
  });
});
