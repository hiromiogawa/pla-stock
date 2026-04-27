import { z } from 'zod'

/**
 * 購入記録入力スキーマ (kit_event reason='purchase' 用)。
 * 旧 StockInput からの互換維持 (フィールド名は同じ)。
 */
export const purchaseEventSchema = z.object({
  purchasedAt: z.string().optional().nullable(),
  purchasePriceYen: z.number().int().nonnegative().nullable().optional(),
  purchaseLocation: z.string().max(100).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
})

export type PurchaseEventInput = z.infer<typeof purchaseEventSchema>

/** @deprecated purchaseEventSchema を使用してください */
export const stockSchema = purchaseEventSchema

/** @deprecated PurchaseEventInput を使用してください */
export type StockInput = PurchaseEventInput
