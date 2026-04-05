import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate as drizzleMigrate } from 'drizzle-orm/better-sqlite3/migrator';

export type DB = ReturnType<typeof drizzle>;

export function connect(path?: string) {
  return drizzle(path || ':memory:');
}

export function migrate(dbInstance: ReturnType<typeof drizzle>, migrationsFolder: string) {
  drizzleMigrate(dbInstance, { migrationsFolder });
}
