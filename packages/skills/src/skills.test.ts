import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const REQUIRED_METADATA_FIELDS = [
  'category_id',
  'category_thai_name',
  'category_english_name',
  'skill_id',
  'skill_thai_name',
  'skill_english_name',
] as const;

const skillsRoot = resolve(__dirname, '.');

function findSkillDirectories(root: string): string[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => join(root, entry.name));
}

const skillDirs = findSkillDirectories(skillsRoot);

describe('skills', () => {
  it('has at least one numbered skill directory', () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  for (const skillDir of skillDirs) {
    const dirName = skillDir.split(/[\\/]/).at(-1) ?? '';

    describe(dirName, () => {
      const skillFile = join(skillDir, 'SKILL.md');
      let raw: string;
      let _frontmatter: Record<string, unknown>;

      it('has a SKILL.md file', () => {
        let content: string;
        try {
          content = readFileSync(skillFile, 'utf8');
        } catch {
          throw new Error(`${dirName}: missing SKILL.md`);
        }
        raw = content;

        const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
        expect(match, `${dirName}: SKILL.md has no valid YAML frontmatter`).not.toBeNull();

        const parsed = parse(match?.[1]) as Record<string, unknown>;
        _frontmatter = parsed ?? {};
      });

      it('frontmatter.name is a string equal to the folder name', () => {
        const content = readFileSync(skillFile, 'utf8');
        const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
        expect(match, `${dirName}: SKILL.md has no valid YAML frontmatter`).not.toBeNull();
        const fm = (parse(match?.[1]) ?? {}) as Record<string, unknown>;

        expect(typeof fm.name, `${dirName}: frontmatter field 'name' must be a string`).toBe('string');
        expect(fm.name, `${dirName}: frontmatter field 'name' must match folder name '${dirName}'`).toBe(dirName);
      });

      it('frontmatter.metadata is an object with all required string fields', () => {
        const content = readFileSync(skillFile, 'utf8');
        const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
        expect(match, `${dirName}: SKILL.md has no valid YAML frontmatter`).not.toBeNull();
        const fm = (parse(match?.[1]) ?? {}) as Record<string, unknown>;

        expect(fm.metadata, `${dirName}: missing frontmatter field 'metadata'`).toBeDefined();
        expect(typeof fm.metadata, `${dirName}: frontmatter field 'metadata' must be an object`).toBe('object');

        const metadata = fm.metadata as Record<string, unknown>;

        for (const field of REQUIRED_METADATA_FIELDS) {
          expect(metadata[field], `${dirName}: metadata.${field} is required`).toBeDefined();
          expect(typeof metadata[field], `${dirName}: metadata.${field} must be a string`).toBe('string');
        }
      });

      it('metadata.skill_id matches the folder name', () => {
        const content = readFileSync(skillFile, 'utf8');
        const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
        expect(match, `${dirName}: SKILL.md has no valid YAML frontmatter`).not.toBeNull();
        const fm = (parse(match?.[1]) ?? {}) as Record<string, unknown>;
        const metadata = (fm.metadata ?? {}) as Record<string, unknown>;

        expect(metadata.skill_id, `${dirName}: metadata.skill_id must match folder name '${dirName}'`).toBe(dirName);
      });
    });
  }
});
