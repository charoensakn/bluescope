import fs from 'node:fs';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate as drizzleMigrate } from 'drizzle-orm/libsql/migrator';

export function connect() {
  return drizzle(':memory:');
}

export function migrate(db: ReturnType<typeof drizzle>, migrationsFolder: string) {
  if (!fs.existsSync(migrationsFolder)) {
    throw new Error(`Migrations folder not found: ${migrationsFolder}`);
  }
  return drizzleMigrate(db, { migrationsFolder });
}
