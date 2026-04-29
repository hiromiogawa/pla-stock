/**
 * Button primitive (MUI v7 + Emotion 隔離方針)。
 *
 * shadcn 由来の variant/size API を MUI Button (および size='icon' は
 * IconButton) にマッピングして橋渡しする wrapper。
 *
 * mapping:
 *   variant
 *     default      → contained primary
 *     destructive  → contained error
 *     outline      → outlined primary
 *     secondary    → contained inherit (grey 系)
 *     ghost        → text primary
 *     link         → text primary + underline (textTransform none)
 *   size
 *     default → 'medium'
 *     sm      → 'small'
 *     lg      → 'large'
 *     icon    → IconButton (button 型ではなく icon 型)
 *
 * 既存の asChild prop (`<Button asChild><Link>...</Link></Button>`) は
 * MUI の `component` prop を call site で直接使うパターンに移行済のため
 * サポートしない。
 *
 * 関連: ADR-0002, CLAUDE.md `## デザイン規約 > Emotion 隔離方針`
 */
import * as React from 'react'
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import type { SxProps, Theme } from '@mui/material/styles'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * Button props.
 *
 * `component` prop を許容するため React.ComponentProps ベース。
 * (TanStack Router の `<Link>` を `component={Link} to="/..."` で渡す call site あり)
 */
type ButtonProps = ButtonOwnProps &
  Omit<MuiButtonProps, 'variant' | 'size' | 'color'> & {
    // 任意 element を受けられるように
    component?: React.ElementType
    // TanStack Router Link 等の追加 prop を許容 (型は call site で narrow される)
    to?: string
  }

type IconButtonAsButtonProps = ButtonOwnProps &
  Omit<IconButtonProps, 'size' | 'color'> & {
    component?: React.ElementType
    to?: string
  }

interface VariantMapping {
  variant: MuiButtonProps['variant']
  color: MuiButtonProps['color']
  sx?: SxProps<Theme>
}

function mapVariantToMui(variant: ButtonVariant): VariantMapping {
  switch (variant) {
    case 'default':
      return { variant: 'contained', color: 'primary' }
    case 'destructive':
      return { variant: 'contained', color: 'error' }
    case 'outline':
      return { variant: 'outlined', color: 'primary' }
    case 'secondary':
      return { variant: 'contained', color: 'inherit' }
    case 'ghost':
      return { variant: 'text', color: 'primary' }
    case 'link':
      return {
        variant: 'text',
        color: 'primary',
        sx: { textDecoration: 'underline', minWidth: 0, padding: 0 },
      }
  }
}

function mapSizeToMui(size: Exclude<ButtonSize, 'icon'>): MuiButtonProps['size'] {
  switch (size) {
    case 'default':
      return 'medium'
    case 'sm':
      return 'small'
    case 'lg':
      return 'large'
  }
}

/** sx を array に正規化することで複数 sx を安全に合成 */
function composeSx(...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> {
  const result: SxProps<Theme>[] = []
  for (const p of parts) {
    if (p === undefined) continue
    if (Array.isArray(p)) {
      // SxProps は readonly array も含むため as で平坦化
      result.push(...(p as SxProps<Theme>[]))
    } else {
      result.push(p)
    }
  }
  // MUI は readonly array を sx として受け取れる
  return result as SxProps<Theme>
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps | IconButtonAsButtonProps>(
  function Button(props, ref) {
    // size / variant / sx を ownProps として剥がし、残りを下位 MUI element に渡す
    const variant: ButtonVariant = (props as ButtonOwnProps).variant ?? 'default'
    const size: ButtonSize = (props as ButtonOwnProps).size ?? 'default'
    const sx = (props as { sx?: SxProps<Theme> }).sx
    // biome-ignore lint/correctness/noUnusedVariables: 分割代入で除外しているだけ
    const { variant: _v, size: _s, sx: _x, ...rest } = props as ButtonProps & ButtonOwnProps
    const muiProps = mapVariantToMui(variant)

    if (size === 'icon') {
      return (
        <IconButton
          ref={ref}
          color={muiProps.color === 'inherit' ? 'default' : muiProps.color}
          sx={composeSx(muiProps.sx, sx)}
          {...(rest as Omit<IconButtonProps, 'size' | 'color'>)}
        />
      )
    }

    return (
      <MuiButton
        ref={ref}
        size={mapSizeToMui(size)}
        variant={muiProps.variant}
        color={muiProps.color}
        disableElevation
        sx={composeSx({ textTransform: 'none' }, muiProps.sx, sx)}
        {...(rest as Omit<MuiButtonProps, 'variant' | 'size' | 'color'>)}
      />
    )
  },
)

export { Button }
