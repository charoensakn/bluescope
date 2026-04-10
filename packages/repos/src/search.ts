import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { BaseRepo } from './base';
import { CaseRepo } from './cases';
import type { DB } from './db_type';

const ftsTable = sqliteTable('cases_fts', {
  id: text(),
  title: text(),
  description: text(),
});

function segmentThaiForFTS(text: string): string[] {
  const seg = new Intl.Segmenter('th', { granularity: 'word' });
  return [...seg.segment(text)]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment.toLocaleLowerCase())
    .filter((s) => s.length > 1);
}

export class SearchRepo extends BaseRepo {
  constructor(
    db: DB,
    public memdb: DB,
  ) {
    super(db);
  }

  async refresh() {
    await this.memdb.run(sql`DROP TABLE IF EXISTS cases_fts`);
    await this.memdb.run(sql`CREATE VIRTUAL TABLE cases_fts USING FTS5(id,title,description)`);
    const caseRepo = new CaseRepo(this.db);
    const cases = await caseRepo.getAll();
    for (const c of cases) {
      const id = c.id;
      const title = segmentThaiForFTS(c.title).join(' ');
      const description = segmentThaiForFTS(c.description).join(' ');
      await this.memdb.run(
        sql`INSERT INTO cases_fts (id, title, description) VALUES (${id}, ${title}, ${description})`,
      );
    }
  }

  async search(query: string, hasRun?: boolean): Promise<string[]> {
    if (!query?.trim()) {
      return [];
    }
    try {
      const tokens = segmentThaiForFTS(query.replace(/["*^()]/g, ' '));
      if (tokens.length === 0) return [];
      // Quote each token for exact term matching; join with OR for better recall
      const ftsQuery = tokens.map((t) => `"${t}"`).join(' OR ');
      const results = await this.memdb.select().from(ftsTable).where(sql`cases_fts MATCH ${ftsQuery}`).limit(10);
      return results.map((r) => r.id);
    } catch {
      if (!hasRun) {
        // If the FTS table doesn't exist, create it and try again
        await this.refresh();
        return this.search(query, true);
      } else {
        return [];
      }
    }
  }
}
