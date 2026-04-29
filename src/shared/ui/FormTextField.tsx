/**
 * FormTextField — TanStack Form + MUI TextField integration wrapper。
 *
 * 既存 view の `<Label> + <Input> + 手書き error` の組合せを 1 行で置換するための
 * 共通 wrapper。`<form.Field>{(field) => ...}` の field を受け取り:
 *
 *   - value / onChange / onBlur / name を field と紐付け
 *   - field.state.meta.errors[0] をエラーメッセージとして helperText に表示
 *   - error 発生時は MUI TextField の error 状態を ON
 *
 * TanStack Form の `errors` 配列は validator (Zod / 関数) の戻り値そのまま。
 * - Zod 経由なら ZodIssue 形 (object, message プロパティ持ち)
 * - string 化された validator なら string
 * - validator 未設定なら空配列
 *
 * 本 wrapper は両方に対応するため `errors[0]?.message ?? errors[0]?.toString()` で
 * 文字列化する。
 *
 * 関連: ADR-0003, CLAUDE.md `## デザイン規約`
 */
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import type { AnyFieldApi } from '@tanstack/react-form'

interface FormTextFieldProps
  extends Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText' | 'name'> {
  field: AnyFieldApi
  /** 補足テキスト (バリデーションエラーが無い時に表示)。エラー時は自動的にエラーメッセージで上書き */
  helperText?: TextFieldProps['helperText']
}

export function FormTextField({ field, helperText, ...rest }: FormTextFieldProps) {
  const errors = field.state.meta.errors as Array<unknown>
  const first = errors[0]
  const errorText =
    typeof first === 'object' && first !== null && 'message' in first
      ? String((first as { message: unknown }).message)
      : first != null
        ? String(first)
        : undefined
  return (
    <TextField
      {...rest}
      name={field.name}
      value={field.state.value ?? ''}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={errors.length > 0}
      helperText={errors.length > 0 ? errorText : helperText}
      fullWidth
      size="small"
    />
  )
}
