import { z } from 'zod'

/**
 * paintId を引数に取る paint query (getPaint / getPaintStock / getPaintEvents) の入力検証。
 * createServerFn().inputValidator() に渡す。
 */
export const paintIdInput = (input: unknown) =>
  z.object({ paintId: z.string().min(1) }).parse(input)
