/**
 * MUI theme entry。
 *
 * src/theme/tokens.ts (engine 非依存) を MUI theme schema に変換するアダプタ層。
 * 将来 Pigment CSS など別 engine に移行しても、tokens.ts は無傷で本ファイルだけ書き換え。
 *
 * 戦略 (#43-style コード規約):
 *   - styling は sx prop で
 *   - styled() は @mui/material/styles から (NEVER @emotion/styled)
 *   - @emotion/* の直接 import は lint で禁止
 */
import { createTheme } from '@mui/material/styles'
import { components } from './components'
import { radius, spacing, tonalPalettes, typography } from './tokens'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tonalPalettes.primary[40],
      light: tonalPalettes.primary[80],
      dark: tonalPalettes.primary[20],
      contrastText: tonalPalettes.primary[100],
    },
    error: {
      main: tonalPalettes.error[40],
      light: tonalPalettes.error[80],
      dark: tonalPalettes.error[20],
      contrastText: tonalPalettes.error[100],
    },
    grey: {
      50: tonalPalettes.neutral[99],
      100: tonalPalettes.neutral[95],
      200: tonalPalettes.neutral[90],
      300: tonalPalettes.neutral[80],
      400: tonalPalettes.neutral[70],
      500: tonalPalettes.neutral[60],
      600: tonalPalettes.neutral[50],
      700: tonalPalettes.neutral[40],
      800: tonalPalettes.neutral[30],
      900: tonalPalettes.neutral[20],
    },
    background: {
      default: tonalPalettes.neutral[99],
      paper: tonalPalettes.neutral[100],
    },
    text: {
      primary: tonalPalettes.neutral[10],
      secondary: tonalPalettes.neutral[40],
      disabled: tonalPalettes.neutral[60],
    },
    divider: tonalPalettes.neutral[90],
  },
  // M3 4dp grid
  spacing: spacing.unit,
  shape: {
    borderRadius: radius.md,
  },
  typography: {
    fontFamily: typography.fontFamily,
    htmlFontSize: 16,
    fontSize: 14,
    h1: pxToRem(typography.scale.headlineLarge),
    h2: pxToRem(typography.scale.headlineMedium),
    h3: pxToRem(typography.scale.headlineSmall),
    h4: pxToRem(typography.scale.titleLarge),
    h5: pxToRem(typography.scale.titleMedium),
    h6: pxToRem(typography.scale.titleSmall),
    body1: pxToRem(typography.scale.bodyLarge),
    body2: pxToRem(typography.scale.bodyMedium),
    caption: pxToRem(typography.scale.bodySmall),
    button: pxToRem(typography.scale.labelLarge),
    overline: pxToRem(typography.scale.labelSmall),
    subtitle1: pxToRem(typography.scale.titleMedium),
    subtitle2: pxToRem(typography.scale.titleSmall),
  },
  components,
})

/** px → rem 変換 (16px base)。M3 type scale を MUI の rem ベース typography に変換するヘルパ */
function pxToRem(scale: { size: number; lineHeight: number; weight: number }) {
  return {
    fontSize: `${scale.size / 16}rem`,
    lineHeight: `${scale.lineHeight / scale.size}`,
    fontWeight: scale.weight,
  }
}
