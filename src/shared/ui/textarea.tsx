/**
 * Textarea primitive (MUI v7 + Emotion 隔離方針)。
 *
 * native `<textarea>` を MUI の `styled('textarea')` (from @mui/material/styles)
 * で包んで theme token を適用する。
 *
 * 関連: ADR-0002, CLAUDE.md `## デザイン規約 > Emotion 隔離方針`
 */
import { styled } from '@mui/material/styles'

export const Textarea = styled('textarea')(({ theme }) => ({
  display: 'flex',
  minHeight: 80,
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
  resize: 'vertical',
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
