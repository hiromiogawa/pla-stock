/**
 * M3 (Material Design 3) 準拠のデザイントークン。
 *
 * pla-stock のトーン: 道具感 (Linear / Notion 風)。
 * neutral / monochrome バリアント = 彩度低め、無彩色中心、状態色のみ彩度あり。
 *
 * 役割:
 *   - engine 非依存 (TS object のみ)、将来 Pigment CSS 等に移行しても無傷
 *   - src/theme/index.ts の createTheme() でこれを MUI theme schema に変換
 *
 * 参考: https://m3.material.io/styles/color/system/overview
 */

/**
 * Tonal palette (M3 規約: 0〜100 の明度段階)
 * 0=黒, 100=白。各色相を 13 段階で持つ。
 * pla-stock では neutral 中心、primary も neutral 寄り (彩度低)。
 */
export const tonalPalettes = {
  // primary = M3 green tonal palette (低彩度寄り、Refined Minimalism と整合)
  // 模型趣味の道具感をわずかに加味して緑系。主役は塗料 swatch、UI は控えめ。
  // 詳細: docs/specs/2026-04-29-design-direction.md
  primary: {
    0: '#000000',
    10: '#002106',
    20: '#003910',
    30: '#00531a',
    40: '#006e25',
    50: '#1a8a30',
    60: '#3aa54a',
    70: '#5cc065',
    80: '#7edc81',
    90: '#9bf99c',
    95: '#c8ffc6',
    99: '#f6fff5',
    100: '#ffffff',
  },
  // neutral = pure grey (背景・境界・本文)
  neutral: {
    0: '#000000',
    10: '#1a1a1a',
    20: '#2e2e2e',
    30: '#444444',
    40: '#5b5b5b',
    50: '#747474',
    60: '#8e8e8e',
    70: '#a8a8a8',
    80: '#c3c3c3',
    90: '#dfdfdf',
    95: '#eeeeee',
    99: '#fbfbfb',
    100: '#ffffff',
  },
  // error = 状態色のみ彩度あり
  error: {
    0: '#000000',
    10: '#410002',
    20: '#690005',
    30: '#93000a',
    40: '#ba1a1a',
    50: '#de3730',
    60: '#ff5449',
    70: '#ff897d',
    80: '#ffb4ab',
    90: '#ffdad6',
    95: '#ffedea',
    99: '#fffbff',
    100: '#ffffff',
  },
} as const

/**
 * M3 4dp grid に基づく spacing unit。
 * MUI の theme.spacing(n) は (n * unit)px を返す。
 */
export const spacing = {
  unit: 4, // 4px grid
} as const

/**
 * M3 corner shape token (pla-stock は角丸控えめ = 道具感)
 */
export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

/**
 * M3 type scale (display/headline/title/body/label の 5 系統)
 * pla-stock では display は使わない想定 (UI 文章中心)。
 */
export const typography = {
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Hiragino Sans', 'Noto Sans JP', sans-serif",
  // pixel ベースで定義 (MUI は rem 変換可能)
  scale: {
    headlineLarge: { size: 32, lineHeight: 40, weight: 600 },
    headlineMedium: { size: 28, lineHeight: 36, weight: 600 },
    headlineSmall: { size: 24, lineHeight: 32, weight: 600 },
    titleLarge: { size: 22, lineHeight: 28, weight: 600 },
    titleMedium: { size: 16, lineHeight: 24, weight: 600 },
    titleSmall: { size: 14, lineHeight: 20, weight: 600 },
    bodyLarge: { size: 16, lineHeight: 24, weight: 400 },
    bodyMedium: { size: 14, lineHeight: 20, weight: 400 },
    bodySmall: { size: 12, lineHeight: 16, weight: 400 },
    labelLarge: { size: 14, lineHeight: 20, weight: 500 },
    labelMedium: { size: 12, lineHeight: 16, weight: 500 },
    labelSmall: { size: 11, lineHeight: 16, weight: 500 },
  },
} as const
