import { z } from 'zod'

export const privateKitSchema = z.object({
  name: z.string().min(1, '名前は必須').max(200),
  grade: z.enum(['HG', 'RG', 'EG', 'MG', 'PG', 'other']),
  scale: z.enum(['1/144', '1/100', '1/60', '1/48', 'other']),
  maker: z.string().min(1, 'メーカーは必須').max(100),
  retailPriceYen: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
})

export type PrivateKitInput = z.infer<typeof privateKitSchema>

export const stockSchema = z.object({
  purchasedAt: z.string().optional().nullable(),
  purchasePriceYen: z.number().int().nonnegative().nullable().optional(),
  purchaseLocation: z.string().max(100).optional().nullable(),
  remark: z.string().max(2000).optional().nullable(),
})

export type StockInput = z.infer<typeof stockSchema>
