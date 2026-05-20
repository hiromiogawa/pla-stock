import { z } from 'zod'
import { KIT_EVENT_REASONS } from '~/entities/kit/schema'

/**
 * 購入記録入力スキーマ (kit_event reason='purchase' 用)。
 */
export const purchaseEventSchema = z.object({
  purchasedAt: z.string().trim().min(1, '購入日は必須です'),
  purchasePriceYen: z.number().int().nonnegative(),
  purchaseLocation: z.string().max(100).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
})

export type PurchaseEventInput = z.infer<typeof purchaseEventSchema>

// NOTE: form schema uses `purchasePriceYen`; server input uses `priceYen`.
// Callers (useKitAdd / useKitDetail) bridge the two field names.
/**
 * addKitEvent server fn の入力検証。userId は含めない (auth() 由来 = IDOR 防止)。
 * kit 固有: projectId は project 紐付け記録用 (reason='project' 時に使用)。
 */
export const addKitEventInput = (input: unknown) =>
  z
    .object({
      kitId: z.string().min(1),
      delta: z
        .number()
        .int()
        .refine((num) => num !== 0, 'delta must be non-zero'),
      reason: z.enum(KIT_EVENT_REASONS),
      projectId: z.string().nullish(),
      purchasedAt: z.string().nullish(),
      priceYen: z.number().int().nonnegative().nullish(),
      purchaseLocation: z.string().max(100).nullish(),
      note: z.string().max(2000).nullish(),
    })
    .parse(input)
