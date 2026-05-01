/**
 * FormTextField — TanStack Form + MUI OutlinedInput integration wrapper。
 *
 * Path A' (Issue #73 / brainstorm 結論): floated label を捨てて外部
 * `FormLabel` を上に配置する label-above 構成。Dialog の Input/Label/Textarea
 * と craft 統一。MUI コンポーネントのみで構成し engine 移行に強い。
 *
 * `<form.Field>{(field) => ...}` の field を受け取り:
 *   - value / onChange / onBlur / name を field と紐付け
 *   - field.state.meta.errors[0] をエラーメッセージとして field 下に表示
 *   - error 発生時は OutlinedInput / FormLabel / FormHelperText の error 状態を ON
 *
 * 関連: ADR-0003 (本 PR で改訂), CLAUDE.md `## デザイン規約 > Emotion 隔離方針`
 */
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import type { InputBaseComponentProps } from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { HTMLInputTypeAttribute, ReactNode } from 'react'
import { extractFieldErrorMessage } from '~/shared/lib/form-error'

interface FormTextFieldProps {
  field: AnyFieldApi
  /** 表示 label。`<FormLabel>` で field 上に出す */
  label: string
  /** バリデーションエラーが無い時に表示する補足テキスト */
  helperText?: ReactNode
  /** 複数行入力。true で OutlinedInput を multiline rows={rows} render */
  multiline?: boolean
  rows?: number
  type?: HTMLInputTypeAttribute
  placeholder?: string
  required?: boolean
  disabled?: boolean
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'search' | 'url' | 'none'
  autoFocus?: boolean
  /** input 要素の HTML 制約 (例: maxLength)。OutlinedInput の inputProps に流す */
  inputProps?: InputBaseComponentProps
}

export function FormTextField({
  field,
  label,
  helperText,
  multiline,
  rows,
  type,
  placeholder,
  required,
  disabled,
  inputMode,
  autoFocus,
  inputProps,
}: FormTextFieldProps) {
  const errors = field.state.meta.errors
  const errorText = errors.length > 0 ? extractFieldErrorMessage(errors[0]) : undefined
  const rawValue = field.state.value
  const value = typeof rawValue === 'string' ? rawValue : ''
  const id = `form-text-${field.name}`
  const hasError = errors.length > 0
  return (
    <Stack spacing={0.75}>
      <FormLabel htmlFor={id} required={required} error={hasError}>
        {label}
      </FormLabel>
      <OutlinedInput
        id={id}
        name={field.name}
        value={value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        multiline={multiline}
        rows={rows}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        inputProps={{
          ...(inputMode ? { inputMode } : {}),
          ...(inputProps ?? {}),
        }}
        autoFocus={autoFocus}
        size="small"
        fullWidth
        error={hasError}
      />
      {(errorText || helperText) && (
        <FormHelperText error={hasError}>{hasError ? errorText : helperText}</FormHelperText>
      )}
    </Stack>
  )
}
