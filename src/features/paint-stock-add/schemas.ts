import { z } from 'zod'

/**
 * 購入記録入力スキーマ (paint_event reason='purchase' 用)。
 */
export const paintPurchaseEventSchema = z.object({
  purchasedAt: z.string().optional().nullable(),
  purchasePriceYen: z.number().int().nonnegative().nullable().optional(),
  purchaseLocation: z.string().max(100).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
})

export type PaintPurchaseEventInput = z.infer<typeof paintPurchaseEventSchema>

/** @deprecated paintPurchaseEventSchema を使用してください */
export const paintStockSchema = paintPurchaseEventSchema

/** @deprecated PaintPurchaseEventInput を使用してください */
export type PaintStockInput = PaintPurchaseEventInput
