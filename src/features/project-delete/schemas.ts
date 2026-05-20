import { z } from 'zod'

/**
 * deleteProject server fn の入力検証。userId は含めない (auth() 由来 = IDOR 防止)。
 */
export const deleteProjectServerInput = (input: unknown) =>
  z
    .object({
      projectId: z.string().min(1),
    })
    .parse(input)
