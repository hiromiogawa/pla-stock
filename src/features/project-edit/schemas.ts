import { z } from 'zod'
import { PROJECT_STATUS_VALUES } from '~/entities/project/schema'

/**
 * updateProject server fn の入力検証。userId は含めない (auth() 由来 = IDOR 防止)。
 * patch は name/description/status/startedAt/completedAt のみ許容 (kitId 変更不可)。
 */
export const updateProjectServerInput = (input: unknown) =>
  z
    .object({
      projectId: z.string().min(1),
      patch: z.object({
        name: z.string().trim().min(1).max(200).optional(),
        description: z.string().max(2000).nullish(),
        status: z.enum(PROJECT_STATUS_VALUES).optional(),
        startedAt: z.string().nullish(),
        completedAt: z.string().nullish(),
      }),
    })
    .parse(input)
