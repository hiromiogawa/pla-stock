import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { createDb } from '~/shared/lib/db/client'
import { deleteProjectPhotoToDb } from './deleteProjectPhotoToDb'
import { deleteProjectPhotoInput } from './schemas'

/**
 * project の写真を削除する（mutation server fn）。
 *
 * - userId は handler 内 auth() 由来（client 入力に含めない = IDOR 防止）
 * - DB 側ロジック (所有確認 + DELETE + r2Key 取得) は deleteProjectPhotoToDb に委譲
 * - D1 DELETE → R2 delete の順。R2 delete 失敗は握り潰す（orphan は無害、D1 行は
 *   既に削除済み）。逆順だと R2 成功 / D1 失敗で壊れ画像が残る
 */
export const deleteProjectPhoto = createServerFn({ method: 'POST' })
  .inputValidator(deleteProjectPhotoInput)
  .handler(async ({ data }): Promise<boolean> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    const result = await deleteProjectPhotoToDb(db, userId, data)
    if (!result.deleted) return false

    if (result.r2Key) {
      try {
        await env.BUCKET.delete(result.r2Key)
      } catch {
        // orphan R2 オブジェクトは無害。D1 行は削除済みなので成功扱いにする。
      }
    }
    return true
  })
