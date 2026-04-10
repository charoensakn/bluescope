import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

// biome-ignore lint/suspicious/noExplicitAny: shared DB type compatible with both better-sqlite3 (sync) and libsql (async) drivers
export type DB = BaseSQLiteDatabase<'async' | 'sync', any, any>;
