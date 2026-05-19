import { z } from 'zod'

/**
 * projectId を引数に取る project query (getProject / getProjectPaintUses /
 * getProjectPaintIds / getProjectPhotos) の入力検証。
 * createServerFn().inputValidator() に渡す。
 */
export const projectIdInput = (input: unknown) =>
  z.object({ projectId: z.string().min(1) }).parse(input)
