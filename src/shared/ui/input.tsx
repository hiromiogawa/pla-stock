/**
 * Input primitive (MUI v7 + Emotion 隔離方針)。
 *
 * native `<input>` を MUI の `styled('input')` (from @mui/material/styles) で
 * 包んで theme token (palette, spacing, transitions) を適用する。
 * MUI TextField を採用しないのは:
 *   - 既存 view が Label + Input を分離している (htmlFor / id 連携)
 *   - native input の type/inputMode/value/onChange/required 等の API を
 *     そのまま使いたい
 *
 * 関連: ADR-0002, CLAUDE.md `## デザイン規約 > Emotion 隔離方針`
 */
import { styled } from '@mui/material/styles'

export const Input = styled('input')(({ theme }) => ({
  display: 'flex',
  height: 40,
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  paddingInline: theme.spacing(3),
  paddingBlock: theme.spacing(2),
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  lineHeight: 1.5,
  outline: 'none',
  transition: theme.transitions.create(['border-color', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:focus-visible': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
  },
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
}))
