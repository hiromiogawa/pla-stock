import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { kits, kitStocks, kitEvents } from '~/entities/kit/schema'
import { paints, paintStocks, paintEvents } from '~/entities/paint/schema'
import { projects, projectPhotos } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/projectPaintUse/schema'
import { mockKits, mockKitStocks, mockKitEvents } from '~/entities/kit/api/mock/kits'
import { mockPaints, mockPaintStocks, mockPaintEvents } from '~/entities/paint/api/mock/paints'
import {
  mockProjects,
  mockProjectPaintUses,
  mockProjectPhotos,
} from '~/entities/project/api/mock/projects'

/**
 * 全ドメインの mock データを D1 (better-sqlite3 経由) に投入する dev seed。
 *
 * - master (kits/paints) は userId 非依存でそのまま
 * - per-user (stocks/events/projects) は mock の MOCK_USER_ID を seedUserId に差し替え
 * - junction/photos は projectId 経由のため userId 差し替え不要
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

  db.insert(kits).values(mockKits).run()
  db.insert(paints).values(mockPaints).run()
  db.insert(kitStocks)
    .values(mockKitStocks.map((stock) => ({ ...stock, userId: seedUserId })))
    .run()
  db.insert(kitEvents)
    .values(mockKitEvents.map((event) => ({ ...event, userId: seedUserId })))
    .run()
  db.insert(paintStocks)
    .values(mockPaintStocks.map((stock) => ({ ...stock, userId: seedUserId })))
    .run()
  db.insert(paintEvents)
    .values(mockPaintEvents.map((event) => ({ ...event, userId: seedUserId })))
    .run()
  db.insert(projects)
    .values(mockProjects.map((project) => ({ ...project, userId: seedUserId })))
    .run()
  db.insert(projectPaintUse).values(mockProjectPaintUses).run()
  db.insert(projectPhotos).values(mockProjectPhotos).run()

  return { kits: mockKits.length, paints: mockPaints.length, projects: mockProjects.length }
}
