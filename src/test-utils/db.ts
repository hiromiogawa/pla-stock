import Database from 'better-sqlite3'
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { resolve } from 'node:path'

/**
 * テスト用 in-memory SQLite を新規作成し、production と同じ Drizzle migration を適用する。
 * D1 と等価な CHECK / UNIQUE / FK 挙動を pure node テストで再現するための要。
 *
 * 各 test の beforeEach で呼ぶことを想定（テスト間 isolation を保つ）。
 */
export function createTestDb(): BetterSQLite3Database {
  const sqlite = new Database(':memory:')
  // FK 制約は SQLite デフォルト OFF。production は D1 が ON 相当なので合わせる
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite)
  migrate(db, { migrationsFolder: resolve(__dirname, '../../drizzle/migrations') })
  return db
}
