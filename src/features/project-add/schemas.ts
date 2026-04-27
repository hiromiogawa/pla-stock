import { z } from 'zod'

/**
 * プロジェクト作成入力スキーマ。
 *
 * - name: 必須 (空文字不可、200 文字まで)
 * - description: 任意 (null 許容、2000 文字まで)
 * - kitId: 必須 (count > 0 の自分の在庫キットの ID)
 *
 * status は 'planning' で初期化されるため入力不要 (mock の addProject 内部で自動セット)。
 */
export const projectAddSchema = z.object({
  name: z.string().trim().min(1, '名前は必須です').max(200),
  description: z.string().max(2000).optional().nullable(),
  kitId: z.string().min(1, 'キットを選択してください'),
})

export type ProjectAddInput = z.infer<typeof projectAddSchema>
