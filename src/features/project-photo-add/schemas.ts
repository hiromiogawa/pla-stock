/**
 * addProjectPhoto server fn の入力（FormData）検証と MIME→拡張子マップ。
 *
 * FormData を扱うため zod ではなく手書きの validator。File / projectId /
 * caption / takenAt を取り出し、画像種別とサイズ（1〜10MB）を検証する。
 * userId は含めない（server fn 内 auth() 由来 = IDOR 防止）。
 */

/** アップロード可能な最大バイト数（生ファイル。圧縮は #136）。 */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** MIME type から R2 key 用の拡張子を導出する（未知の型は 'bin'）。 */
export function extForMime(mime: string): string {
  return MIME_TO_EXT[mime] ?? 'bin'
}

interface AddProjectPhotoData {
  file: File
  projectId: string
  caption: string | null
  takenAt: string | null
}

/** addProjectPhoto の FormData 入力を検証して構造化データに変換する。 */
export function parseAddProjectPhotoInput(input: unknown): AddProjectPhotoData {
  if (!(input instanceof FormData)) throw new Error('不正なリクエストです')

  const file = input.get('file')
  if (!(file instanceof File)) throw new Error('画像ファイルが必要です')
  if (!file.type.startsWith('image/')) throw new Error('画像ファイルを選択してください')
  if (file.size === 0) throw new Error('空のファイルです')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('ファイルサイズは 10MB までです')

  const projectId = input.get('projectId')
  if (typeof projectId !== 'string' || projectId.length === 0) {
    throw new Error('projectId が必要です')
  }

  const caption = input.get('caption')
  const takenAt = input.get('takenAt')
  return {
    file,
    projectId,
    caption: typeof caption === 'string' && caption.trim() !== '' ? caption.trim() : null,
    takenAt: typeof takenAt === 'string' && takenAt.trim() !== '' ? takenAt : null,
  }
}
