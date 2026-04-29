/**
 * FormSelect — TanStack Form + MUI Select integration wrapper。
 *
 * `<form.Field>` の field と option 配列を渡すと、FormControl + InputLabel +
 * Select + MenuItem + FormHelperText を一括で生成する。
 *
 *   - value / onChange / onBlur / name を field と紐付け
 *   - field.state.meta.errors[0] をエラーメッセージとして表示
 *   - placeholder 風プレースホルダが必要な場合は options に
 *     `{ value: '', label: '...' }` を入れる pattern を採る
 *
 * 関連: ADR-0003, CLAUDE.md `## デザイン規約`
 */
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectProps } from '@mui/material/Select'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { extractFieldErrorMessage } from '~/shared/lib/form-error'

export interface FormSelectOption {
  value: string
  label: ReactNode
}

interface FormSelectProps
  extends Omit<SelectProps<string>, 'value' | 'onChange' | 'onBlur' | 'name' | 'error'> {
  field: AnyFieldApi
  label: string
  options: FormSelectOption[]
  helperText?: ReactNode
}

export function FormSelect({ field, label, options, helperText, ...rest }: FormSelectProps) {
  const errors = field.state.meta.errors
  const errorText = errors.length > 0 ? extractFieldErrorMessage(errors[0]) : undefined
  const rawValue = field.state.value
  const value = typeof rawValue === 'string' ? rawValue : ''
  const id = `form-select-${field.name}`
  return (
    <FormControl fullWidth size="small" error={errors.length > 0}>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        {...rest}
        labelId={`${id}-label`}
        id={id}
        name={field.name}
        label={label}
        value={value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
      {(errorText || helperText) && (
        <FormHelperText>{errors.length > 0 ? errorText : helperText}</FormHelperText>
      )}
    </FormControl>
  )
}
