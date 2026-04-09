import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate as drizzleMigrate } from 'drizzle-orm/better-sqlite3/migrator';

export function connect() {
  return drizzle(':memory:');
}

export function migrate(db: ReturnType<typeof connect>, migrationsFolder: string) {
  drizzleMigrate(db, { migrationsFolder });
}
