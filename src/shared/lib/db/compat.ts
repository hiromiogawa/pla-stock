import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

/**
 * production (D1) と test (better-sqlite3 :memory:) の両方を受け取れる
 * Drizzle DB 型の union。SQL は同一、atomic 実行 API (batch / transaction) と
 * SELECT の sync/async が分岐する。
 */
export type CompatibleDb = BetterSQLite3Database | DrizzleD1Database

/**
 * D1 (DrizzleD1Database) は db.batch を持つが、better-sqlite3 は持たない。
 * この差分で type guard し、両者で同じ SQL を atomic に実行する。
 */
export function isD1Db(db: CompatibleDb): db is DrizzleD1Database {
  return 'batch' in db && typeof db.batch === 'function'
}

/**
 * production の D1 で起きる D1/SQLite の在庫 CHECK(count>=0) 制約違反を判定する。
 *
 * `CHECK constraint failed` かつ stock count 非負制約名を含むときのみ true。
 * 無関係な CHECK 違反 / その他 error は false → 呼び出し側で元 error を re-throw する。
 */
export function isStockCheckViolation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('CHECK constraint failed') &&
    (message.includes('kit_stocks_count_non_negative') ||
      message.includes('paint_stocks_count_non_negative'))
  )
}
