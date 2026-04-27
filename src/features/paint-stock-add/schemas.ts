import { z } from 'zod'

const COLOR_FAMILIES = [
  '赤',
  '青',
  '黄',
  '緑',
  '白',
  '黒',
  '銀',
  '金',
  '茶',
  '蛍光',
  'クリア',
  'other',
] as const

const FINISH_TYPES = [
  '光沢',
  '半光沢',
  'つや消し',
  'メタリック',
  'パール',
  'クリア',
  'プライマー',
  'ウェザリング',
] as const

export const privatePaintSchema = z.object({
  brand: z.string().min(1, 'ブランドは必須').max(100),
  code: z.string().min(1, 'コードは必須').max(50),
  name: z.string().min(1, '名前は必須').max(200),
  colorFamily: z.enum(COLOR_FAMILIES).nullable().optional(),
  finishType: z.enum(FINISH_TYPES).nullable().optional(),
})

export type PrivatePaintInput = z.infer<typeof privatePaintSchema>

export const paintStockSchema = z.object({
  purchasedAt: z.string().optional().nullable(),
  purchasePriceYen: z.number().int().nonnegative().nullable().optional(),
  remark: z.string().max(2000).optional().nullable(),
})

export type PaintStockInput = z.infer<typeof paintStockSchema>
