/**
 * FormSelect — TanStack Form + MUI Select integration wrapper。
 *
 * Path A' (Issue #73 / brainstorm 結論): FormControl + floated InputLabel を
 * 捨てて、外部 FormLabel + 裸の Select で label-above 構成に。Dialog の
 * Label + Input pattern と craft 統一。dropdown popover は MUI Select の
 * theme 統合 UI のまま (light/dark 対応、keyboard nav OK)。
 *
 * `<form.Field>` の field と option 配列を受け取り:
 *   - value / onChange / onBlur / name を field と紐付け
 *   - field.state.meta.errors[0] をエラーメッセージとして field 下に表示
 *   - placeholder 風プレースホルダが必要な場合は options に
 *     `{ value: '', label: '...' }` を入れる pattern を採る
 *
 * 関連: ADR-0003 (本 PR で改訂), CLAUDE.md `## デザイン規約`
 */
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { extractFieldErrorMessage } from '~/shared/lib/form-error'

export interface FormSelectOption {
  value: string
  label: ReactNode
}

interface FormSelectProps {
  field: AnyFieldApi
  label: string
  options: FormSelectOption[]
  helperText?: ReactNode
  required?: boolean
  disabled?: boolean
}

export function FormSelect({
  field,
  label,
  options,
  helperText,
  required,
  disabled,
}: FormSelectProps) {
  const errors = field.state.meta.errors
  const errorText = errors.length > 0 ? extractFieldErrorMessage(errors[0]) : undefined
  const rawValue = field.state.value
  const value = typeof rawValue === 'string' ? rawValue : ''
  const id = `form-select-${field.name}`
  const hasError = errors.length > 0
  return (
    <Stack spacing={0.75}>
      <FormLabel htmlFor={id} required={required} error={hasError}>
        {label}
      </FormLabel>
      <Select<string>
        id={id}
        name={field.name}
        value={value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        required={required}
        disabled={disabled}
        size="small"
        fullWidth
        error={hasError}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(errorText || helperText) && (
        <FormHelperText error={hasError}>{hasError ? errorText : helperText}</FormHelperText>
      )}
    </Stack>
  )
}
