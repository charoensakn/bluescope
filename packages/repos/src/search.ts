import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { BaseRepo } from './base';
import { CaseRepo } from './cases';
import type { DB } from './db';

const ftsTable = sqliteTable('cases_fts', {
  id: text(),
  title: text(),
  description: text(),
});

function segmentThaiForFTS(text: string) {
  const seg = new Intl.Segmenter('th', { granularity: 'word' });
  return [...seg.segment(text)]
    .map((s) => s.segment)
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
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
      const title = segmentThaiForFTS(c.title) || '';
      const description = segmentThaiForFTS(c.description) || '';
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
      const segmentedQuery = segmentThaiForFTS(query.replace(/['";]+/g, ' '));
      const results = await this.memdb.select().from(ftsTable).where(sql`cases_fts MATCH ${segmentedQuery}`).limit(10);
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
