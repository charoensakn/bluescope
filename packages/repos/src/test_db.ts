// @ts-expect-error: This file is used in tests and may import modules that are not used in production code, which can cause TypeScript to report errors about unused imports. By adding this directive, we can suppress those errors and allow the tests to run without issues.
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate as drizzleMigrate } from 'drizzle-orm/bun-sqlite/migrator';

export function connect() {
  return drizzle(new Database(':memory:'));
}

export function migrate(db: ReturnType<typeof connect>, migrationsFolder: string) {
  drizzleMigrate(db, { migrationsFolder });
}
