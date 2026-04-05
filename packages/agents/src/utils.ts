import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse } from 'yaml';

const skillCache = new Map<string, Skill[]>();

export type Skill = {
  name: string;
  description: string;
  categoryId: string;
  categoryNameEn: string;
  categoryNameTh: string;
  skillId: string;
  skillNameEn: string;
  skillNameTh: string;
  skill: string;
  reference: string;
};

type FrontmatterMetadata = {
  category_id?: unknown;
  category_english_name?: unknown;
  category_thai_name?: unknown;
  skill_id?: unknown;
  skill_english_name?: unknown;
  skill_thai_name?: unknown;
};

type Frontmatter = {
  name?: unknown;
  description?: unknown;
  metadata?: FrontmatterMetadata;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function findSkillFiles(rootPath: string): string[] {
  if (!existsSync(rootPath)) {
    return [];
  }

  const skillFiles: string[] = [];
  const entries = readdirSync(rootPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = join(rootPath, entry.name);
    if (entry.isDirectory()) {
      skillFiles.push(...findSkillFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'SKILL.md') {
      skillFiles.push(fullPath);
    }
  }

  return skillFiles;
}

export function loadSkills(path: string): Skill[] {
  const cached = skillCache.get(path);
  if (cached) {
    return cached;
  }

  const skillFiles = findSkillFiles(path);
  const skills: Skill[] = [];

  for (const filePath of skillFiles) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const frontmatterMatch = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);

      if (!frontmatterMatch) {
        continue;
      }

      const frontmatter = (parse(frontmatterMatch[1]) ?? {}) as Frontmatter;
      const metadata = frontmatter.metadata ?? {};

      const referencePath = join(dirname(filePath), 'references', 'doc.md');
      let reference = '';
      if (existsSync(referencePath)) {
        reference = readFileSync(referencePath, 'utf8');
      }

      skills.push({
        name: asString(frontmatter.name),
        description: asString(frontmatter.description),
        categoryId: asString(metadata.category_id),
        categoryNameEn: asString(metadata.category_english_name),
        categoryNameTh: asString(metadata.category_thai_name),
        skillId: asString(metadata.skill_id),
        skillNameEn: asString(metadata.skill_english_name),
        skillNameTh: asString(metadata.skill_thai_name),
        skill: frontmatterMatch[2].trimStart(),
        reference,
      });
    } catch {
      // Ignore errors and continue loading other skills
    }
  }

  skillCache.set(path, skills);

  return skills;
}
