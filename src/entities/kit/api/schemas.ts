import { z } from 'zod'

/**
 * kitId を引数に取る kit query (getKit / getKitStock / getKitEvents) の入力検証。
 * createServerFn().inputValidator() に渡す。
 */
export const kitIdInput = (input: unknown) => z.object({ kitId: z.string().min(1) }).parse(input)
