import { z } from 'zod'
import { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES } from '~/entities/paint'

export const privatePaintSchema = z.object({
  brand: z.string().min(1, 'ブランドは必須').max(100),
  code: z.string().min(1, 'コードは必須').max(50),
  name: z.string().min(1, '名前は必須').max(200),
  colorFamily: z.enum(COLOR_FAMILY_VALUES).nullable().optional(),
  finishType: z.enum(FINISH_TYPE_VALUES).nullable().optional(),
})

export type PrivatePaintInput = z.infer<typeof privatePaintSchema>

export const paintStockSchema = z.object({
  purchasedAt: z.string().optional().nullable(),
  purchasePriceYen: z.number().int().nonnegative().nullable().optional(),
  remark: z.string().max(2000).optional().nullable(),
})

export type PaintStockInput = z.infer<typeof paintStockSchema>
