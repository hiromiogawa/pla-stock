import { and, eq } from 'drizzle-orm'
import type { Project, ProjectStatus } from '~/entities/project'
import { projects } from '~/entities/project/schema'
import type { CompatibleDb } from '~/shared/lib/db/compat'

type UpdateProjectData = {
  projectId: string
  patch: {
    name?: string
    description?: string | null
    status?: ProjectStatus
    startedAt?: string | null
    completedAt?: string | null
  }
}

/**
 * project 更新 mutation の DB ロジック本体。auth / env から分離した純粋関数で、
 * production の D1 でも test の in-memory better-sqlite3 でも動く。
 *
 * 動作:
 * - WHERE id=? AND user_id=? で他人の project には書き込めない (IDOR 防御)
 * - 該当行が無ければ null を返す (not found / forbidden を区別しない)
 * - kitId 変更は schema レベル不可 (patch 型で除外、入力検証も拒否)
 * - kit 在庫への影響なし (作成/削除でのみ kit_events を触る)
 */
export async function updateProjectToDb(
  db: CompatibleDb,
  userId: string,
  data: UpdateProjectData,
): Promise<Project | null> {
  const updated = await db
    .update(projects)
    .set(data.patch)
    .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
    .returning()

  return updated[0] ?? null
}
