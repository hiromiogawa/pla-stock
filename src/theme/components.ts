/**
 * MUI コンポーネントの defaultProps / styleOverrides。
 *
 * 各コンポーネントの「デフォルト挙動」「サイズ」「角丸」等を集中管理。
 * 個別 view で sx prop を毎回書くと散らかるので、共通の見た目はここで一元化。
 *
 * Phase α (spike) では空。Phase β で Button / Dialog / TextField 等を順次追加。
 */
import type { Components, Theme } from '@mui/material/styles'

export const components: Components<Theme> = {
  // 例 (Phase β で本格化):
  // MuiButton: {
  //   defaultProps: { variant: 'contained', disableElevation: true },
  //   styleOverrides: {
  //     root: { textTransform: 'none' }, // 大文字変換しない (日本語 UI で違和感)
  //   },
  // },
}
