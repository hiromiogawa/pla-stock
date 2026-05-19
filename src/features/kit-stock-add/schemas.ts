import { z } from 'zod'

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
