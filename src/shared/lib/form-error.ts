/**
 * TanStack Form の `field.state.meta.errors` 配列の先頭要素を文字列化する共通 helper。
 *
 * TanStack Form の `errors` 配列は validator (Zod / 関数) の戻り値そのままが入る:
 * - Zod 経由なら ZodIssue 形 (object, message プロパティ持ち)
 * - 関数 validator なら string
 * - validator 未設定なら空配列
 *
 * 本 helper は両方に対応するため `typeof` / `'in'` operator による型 narrowing で
 * 文字列化する。三項演算子のネスト・型アサーション (`as`) は使わない。
 *
 * 関連: PR #56 レビュー指摘 (FormSelect.tsx:43), ADR-0003
 */
export function extractFieldErrorMessage(error: unknown): string | undefined {
  if (error == null) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error) {
    if (typeof error.message === 'string') return error.message
  }
  return String(error)
}
