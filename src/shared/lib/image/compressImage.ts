import imageCompression, { type Options } from 'browser-image-compression'
import { MAX_ORIGINAL_BYTES, isAcceptedImageType } from './constants'

/**
 * 圧縮処理の結果。
 * - file: アップロード対象の WebP File
 * - originalSize / compressedSize: 圧縮前後のバイト数（UI のサイズ表示用）
 */
interface ProcessedImage {
  file: File
  originalSize: number
  compressedSize: number
}

/**
 * browser-image-compression のオプション（ADR-0013 準拠）。
 * - maxWidthOrHeight: 長辺 1600px にリサイズ
 * - fileType: WebP に変換
 * - maxSizeMB: 数百 KB ターゲット
 * - useWebWorker: false — true だと Web Worker が既定で jsdelivr CDN から
 *   ライブラリ本体を importScripts する（実行時の外部依存・CSP/オフラインで破綻）。
 *   単一画像のリサイズ圧縮はメインスレッドでも一瞬のため自己完結を優先する
 */
const COMPRESSION_OPTIONS: Options = {
  maxWidthOrHeight: 1600,
  fileType: 'image/webp',
  maxSizeMB: 0.5,
  useWebWorker: false,
}

/**
 * 選択画像を検証し WebP に圧縮する（アップロード前のクライアント処理）。
 *
 * - allowlist 外の type → Error（HEIC 等。呼び出し側が拒否メッセージ表示）
 * - 原本が MAX_ORIGINAL_BYTES 超 → Error
 * - browser-image-compression で WebP 変換 + 長辺 1600px リサイズ
 * - 戻り値の File は `.webp` 拡張子・`image/webp` 型に正規化する
 */
export async function processImageForUpload(file: File): Promise<ProcessedImage> {
  if (!isAcceptedImageType(file.type)) {
    throw new Error('この形式は非対応です（JPEG / PNG / WebP をご利用ください）')
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error('ファイルが大きすぎます（30MB まで）')
  }

  let compressed: File
  try {
    compressed = await imageCompression(file, COMPRESSION_OPTIONS)
  } catch (cause) {
    throw new Error('画像の処理に失敗しました', { cause })
  }

  // browser-image-compression は fileType 指定時も元の name を保つため
  // `.webp` 名・image/webp 型の File に作り直す
  const webpName = `${file.name.replace(/\.[^.]+$/, '')}.webp`
  const webpFile = new File([compressed], webpName, { type: 'image/webp' })

  return {
    file: webpFile,
    originalSize: file.size,
    compressedSize: webpFile.size,
  }
}
