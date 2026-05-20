import { z } from 'zod'

/**
 * addProjectPaintUse / removeProjectPaintUse の入力検証。
 * userId は含めない (auth() 由来 = IDOR 防止、handler 内で project の所有確認)。
 */
export const projectPaintUseServerInput = (input: unknown) =>
  z
    .object({
      projectId: z.string().min(1),
      paintId: z.string().min(1),
    })
    .parse(input)
