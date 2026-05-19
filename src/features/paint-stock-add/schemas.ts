import { z } from 'zod'
import { PAINT_EVENT_REASONS } from '~/entities/paint/schema'

/**
 * 購入記録入力スキーマ (paint_event reason='purchase' 用)。
 */
export const paintPurchaseEventSchema = z.object({
  purchasedAt: z.string().trim().min(1, '購入日は必須です'),
  purchasePriceYen: z.number().int().nonnegative(),
  purchaseLocation: z.string().max(100).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
})

export type PaintPurchaseEventInput = z.infer<typeof paintPurchaseEventSchema>

// NOTE: form schema uses `purchasePriceYen`; server input uses `priceYen`.
// Callers (usePaintAdd/usePaintDetail) bridge the two field names.
/**
 * addPaintEvent server fn の入力検証。userId は含めない (auth() 由来)。
 */
export const addPaintEventInput = (input: unknown) =>
  z
    .object({
      paintId: z.string().min(1),
      delta: z
        .number()
        .int()
        .refine((num) => num !== 0, 'delta must be non-zero'),
      reason: z.enum(PAINT_EVENT_REASONS),
      purchasedAt: z.string().nullish(),
      priceYen: z.number().int().nonnegative().nullish(),
      purchaseLocation: z.string().max(100).nullish(),
      note: z.string().max(2000).nullish(),
    })
    .parse(input)
