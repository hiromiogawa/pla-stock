import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { kits, kitStocks, kitEvents } from '~/entities/kit/schema'
import { paints, paintStocks, paintEvents } from '~/entities/paint/schema'
import { projects, projectPhotos } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/project-paint-use/schema'
import { seedKits, seedKitStocks, seedKitEvents } from '~/entities/kit/api/seed/kits'
import { seedPaints, seedPaintStocks, seedPaintEvents } from '~/entities/paint/api/seed/paints'
import { seedProjects, seedProjectPaintUses } from '~/entities/project/api/seed/projects'

/**
 * 全ドメインの seed データを D1 (better-sqlite3 経由) に投入する dev seed。
 *
 * - master (kits/paints) は userId 非依存でそのまま
 * - per-user (stocks/events/projects) は seed の SEED_USER_ID を seedUserId に差し替え
 * - junction は projectId 経由のため userId 差し替え不要
 * - project_photos は seed しない (R2 実体が無いため。アプリ上で実アップロードする)。
 *   reseed で既存アップロード写真を消すため delete のみ残す
 * - 冪等化のため truncate-then-insert (FK 逆順で delete → 親→子で insert)。dev 専用
 */
export function seedDatabase(
  db: BetterSQLite3Database,
  seedUserId: string,
): { kits: number; paints: number; projects: number } {
  db.delete(projectPhotos).run()
  db.delete(projectPaintUse).run()
  db.delete(kitEvents).run()
  db.delete(paintEvents).run()
  db.delete(kitStocks).run()
  db.delete(paintStocks).run()
  db.delete(projects).run()
  db.delete(kits).run()
  db.delete(paints).run()

  db.insert(kits).values(seedKits).run()
  db.insert(paints).values(seedPaints).run()
  db.insert(kitStocks)
    .values(seedKitStocks.map((stock) => ({ ...stock, userId: seedUserId })))
    .run()
  db.insert(kitEvents)
    .values(seedKitEvents.map((event) => ({ ...event, userId: seedUserId })))
    .run()
  db.insert(paintStocks)
    .values(seedPaintStocks.map((stock) => ({ ...stock, userId: seedUserId })))
    .run()
  db.insert(paintEvents)
    .values(seedPaintEvents.map((event) => ({ ...event, userId: seedUserId })))
    .run()
  db.insert(projects)
    .values(seedProjects.map((project) => ({ ...project, userId: seedUserId })))
    .run()
  db.insert(projectPaintUse).values(seedProjectPaintUses).run()

  return { kits: seedKits.length, paints: seedPaints.length, projects: seedProjects.length }
}
