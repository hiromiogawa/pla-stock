import { z } from 'zod'

/**
 * deleteProjectPhoto server fn の入力検証。
 * userId は含めない（auth() 由来 = IDOR 防止）。所有確認は handler 内で join。
 */
export const deleteProjectPhotoInput = (input: unknown) =>
  z.object({ photoId: z.string().min(1) }).parse(input)
