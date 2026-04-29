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
 *
 * Light / Dark 両対応:
 *   M3 tonal palette の使い分けで切り替え。
 *   - Light: primary main = 40, text.primary = neutral 10, bg = neutral 99
 *   - Dark:  primary main = 80, text.primary = neutral 95, bg = neutral 10
 */
import { createTheme, type Theme } from '@mui/material/styles'
import { components } from './components'
import { radius, spacing, tonalPalettes, typography } from './tokens'

export type ThemeMode = 'light' | 'dark'

export function createAppTheme(mode: ThemeMode): Theme {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: {
        main: tonalPalettes.primary[isDark ? 80 : 40],
        light: tonalPalettes.primary[isDark ? 60 : 80],
        dark: tonalPalettes.primary[isDark ? 40 : 20],
        contrastText: tonalPalettes.primary[isDark ? 20 : 100],
      },
      error: {
        main: tonalPalettes.error[isDark ? 80 : 40],
        light: tonalPalettes.error[isDark ? 60 : 80],
        dark: tonalPalettes.error[isDark ? 40 : 20],
        contrastText: tonalPalettes.error[isDark ? 20 : 100],
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
        default: tonalPalettes.neutral[isDark ? 10 : 99],
        paper: tonalPalettes.neutral[isDark ? 20 : 100],
      },
      text: {
        primary: tonalPalettes.neutral[isDark ? 95 : 10],
        secondary: tonalPalettes.neutral[isDark ? 70 : 40],
        disabled: tonalPalettes.neutral[isDark ? 50 : 60],
      },
      divider: tonalPalettes.neutral[isDark ? 30 : 90],
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
}

/** px → rem 変換 (16px base)。M3 type scale を MUI の rem ベース typography に変換するヘルパ */
function pxToRem(scale: { size: number; lineHeight: number; weight: number }) {
  return {
    fontSize: `${scale.size / 16}rem`,
    lineHeight: `${scale.lineHeight / scale.size}`,
    fontWeight: scale.weight,
  }
}
