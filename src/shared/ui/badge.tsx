/**
 * Badge primitive (MUI v7 + Emotion 隔離方針)。
 *
 * shadcn 由来の API (variant prop, className 受領) を維持しつつ、
 * 内部実装は MUI の `styled('span')` (from @mui/material/styles) で書換え。
 *
 * 関連: ADR-0002, CLAUDE.md `## デザイン規約 > Emotion 隔離方針`
 */
import * as React from 'react'
import { styled } from '@mui/material/styles'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const BadgeRoot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: BadgeVariant }>(({ theme, variant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 9999,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'transparent',
  paddingInline: theme.spacing(2.5),
  paddingBlock: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.4,
  transition: theme.transitions.create(['background-color', 'color', 'border-color']),
  ...(variant === 'default' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  }),
  ...(variant === 'destructive' && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
  ...(variant === 'outline' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
  }),
}))

function Badge({ variant = 'default', ...props }: BadgeProps) {
  return <BadgeRoot variant={variant} {...props} />
}

export { Badge }
