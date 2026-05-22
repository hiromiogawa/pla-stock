/**
 * 写真アップロードの形式・サイズ制約（browser-free な純定数）。
 *
 * client (compressImage.ts) と server fn (project-photo-add/schemas.ts) の
 * 双方から参照する SSoT。browser-only な import を持たないため、server fn が
 * 本ファイルを import しても Cloudflare Workers バンドルに
 * browser-image-compression を巻き込まない。
 */

/** アップロード許可 MIME（ブラウザが表示でき Canvas でデコードできる形式）。 */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** 原本ファイルの最大バイト数（圧縮前。処理ハング防止の緩い上限）。 */
export const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024

/** 与えられた MIME type がアップロード許可形式かを判定する。 */
export function isAcceptedImageType(type: string): boolean {
  return ACCEPTED_IMAGE_TYPES.some((accepted) => accepted === type)
}
