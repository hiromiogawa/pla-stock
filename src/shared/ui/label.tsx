/**
 * Label primitive (MUI v7 + Emotion 隔離方針)。
 *
 * native `<label>` を MUI の `styled('label')` (from @mui/material/styles) で
 * 包む。MUI InputLabel は TextField 前提の floating label のため、
 * 独立した Label として使う本プロジェクトの流儀には合わない。
 *
 * 関連: ADR-0002, CLAUDE.md `## デザイン規約 > Emotion 隔離方針`
 */
import { styled } from '@mui/material/styles'

export const Label = styled('label')(({ theme }) => ({
  display: 'inline-block',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1,
  color: theme.palette.text.primary,
  '&[data-disabled="true"]': {
    cursor: 'not-allowed',
    opacity: 0.7,
  },
}))
