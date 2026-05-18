import { existsSync, globSync } from 'node:fs'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { seedDatabase } from '../src/shared/lib/db/seed.ts'

/**
 * local D1 (miniflare) の sqlite ファイルを開いて seed を投入する。
 *
 * 使い方:
 *   SEED_USER_ID=user_xxx pnpm db:seed:local
 *
 * SEED_USER_ID 未指定時は 'dev-seed-user' で投入するが、実装の server fn は
 * 実 Clerk userId で filter するため per-user 画面 (在庫数/履歴) は空に見える。
 */

const candidates = globSync('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite')

if (candidates.length === 0) {
  console.error('local D1 sqlite が見つかりません。先に `pnpm db:migrate:local` を実行してください。')
  process.exit(1)
}

const dbPath = resolve(candidates[0])
if (!existsSync(dbPath)) {
  console.error(`sqlite path が存在しません: ${dbPath}`)
  process.exit(1)
}

const seedUserId = process.env.SEED_USER_ID ?? 'dev-seed-user'
if (!process.env.SEED_USER_ID) {
  console.warn(
    '[warn] SEED_USER_ID 未指定。per-user データは "dev-seed-user" で投入されます。\n' +
      '       実 Clerk userId でないと在庫数・履歴画面は空に見えます。\n' +
      '       SEED_USER_ID=user_xxx pnpm db:seed:local で指定してください。',
  )
}

const sqlite = new Database(dbPath)
const db = drizzle(sqlite)
const result = seedDatabase(db, seedUserId)
sqlite.close()

console.log(
  `seed 完了: kits=${result.kits}, paints=${result.paints}, projects=${result.projects} (userId=${seedUserId})`,
)
