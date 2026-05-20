import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq, sql } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects, projectPhotos } from '~/entities/project/schema'
import { kitStocks, kitEvents } from '~/entities/kit/schema'
import { deleteProjectServerInput } from './schemas'

/**
 * プロジェクトを削除する。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - status='planning' なら kit 在庫を +1 戻す (kit_events insert + kit_stocks upsert)
 * - project_paint_use は schema の onDelete: 'cascade' で自動削除 (本 PR で追加)
 * - project_photos は schema cascade 未設定のため handler 内で先に明示削除
 *   (Phase D で R2 物理削除と一体化するときに schema cascade 検討予定)
 * - 戻し有/無で batch 構成が変わるため if 分岐で 2 batch を出し分け
 */
export const deleteProject = createServerFn({ method: 'POST' })
  .inputValidator(deleteProjectServerInput)
  .handler(async ({ data }): Promise<boolean> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    const existing = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .get()

    if (!existing) return false

    if (existing.status === 'planning') {
      // 在庫を戻す + 削除 (4 SQL の atomic batch)
      const kitEvent = {
        id: crypto.randomUUID(),
        userId,
        kitId: existing.kitId,
        delta: 1,
        reason: 'project' as const,
        projectId: existing.id,
        purchasedAt: null,
        priceYen: null,
        purchaseLocation: null,
        note: 'returned from cancelled planning',
        createdAt: new Date(),
      }
      const nextCount = sql<number>`(select coalesce((select ${kitStocks.count} from ${kitStocks} where ${kitStocks.userId} = ${userId} and ${kitStocks.kitId} = ${existing.kitId}), 0) + 1)`

      await db.batch([
        db
          .insert(kitStocks)
          .values({ userId, kitId: existing.kitId, count: nextCount })
          .onConflictDoUpdate({
            target: [kitStocks.userId, kitStocks.kitId],
            set: { count: sql`${kitStocks.count} + 1` },
          }),
        db.insert(kitEvents).values(kitEvent),
        db.delete(projectPhotos).where(eq(projectPhotos.projectId, data.projectId)),
        db
          .delete(projects)
          .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId))),
      ])
    } else {
      // 戻しなし: photo 明示削除 + project 削除
      await db.batch([
        db.delete(projectPhotos).where(eq(projectPhotos.projectId, data.projectId)),
        db
          .delete(projects)
          .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId))),
      ])
    }

    return true
  })
