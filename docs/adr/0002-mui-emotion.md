# ADR-0002: shadcn + Tailwind から MUI v7 + Emotion へ移行

- ステータス: 承認 (Phase α 着手時点)
- 日付: 2026-04-28
- 関連: Issue #42 (UI/UX 整備)、PR #51 (Container/Hook/Presenter)

## 文脈

Phase A-2 完了し、Phase 3 (デザインブラッシュアップ) に着手する局面。  
現状は **shadcn/ui + Tailwind v4** で実装されている (PR 群 #41 〜 #46)。

shadcn は実装ライブラリであり、デザインシステム (規律体系) ではない。  
そのため:

- 「Button をどう並べる」「色は何系を使う」等の判断ルールが言語化されていない
- AI コーディング時に AI が判断する根拠がなく、結果がばらつく
- 規律を CLAUDE.md に自前で書き起こすコストが高く、書いても情報量で既存システムに勝てない

一方、**Material Design 3** (Google) は:

- color / typography / spacing / elevation / motion / state layer まで詳細な数値ルールが公開
- AI training data に大量に含まれている (Stack Overflow / docs / tutorials)
- web / iOS / Android の design system として 10 年以上使用、成熟度高

→ AI コーディング親和性で M3 が圧倒的優位。

## 決定

**shadcn/ui + Tailwind v4 を撤去し、MUI v7 + Emotion に完全移行する。**

### styling engine: Emotion (NOT Pigment CSS)

MUI v7 の default は Emotion (runtime CSS-in-JS)。  
Pigment CSS (zero-runtime、MUI 公式の次世代 styling engine) は技術的に優れるが:

- 2026-04 時点で成熟度 ★★★ (発展中)
- TanStack Start + Cloudflare workerd での動作実績乏しい
- AI training data が少なく、AI コーディング時の参照情報が薄い

「**情報量・依存最小化・成熟度**」を優先し Emotion を選択。  
Pigment CSS への将来移行は **Emotion 隔離戦略** (下記) で容易にする。

### Tailwind の扱い: 撤去

部分共存は「token の source of truth が 2 つ」問題を引き起こす。  
MUI 単体に絞り、layout utility も `sx` prop に統一する。

### 採用しなかった選択肢

| 選択肢 | 却下理由 |
|---|---|
| shadcn 継続 + M3 token 借用 (ハイブリッド) | 規律強度で MUI に劣る、自前メンテコスト残存 |
| MUI v9 | 2026-04 リリースで AI training data 不足 |
| MUI v7 + Pigment CSS | 成熟度・情報量不足 |
| Carbon / Fluent UI 2 / Polaris | M3 ほどの AI 親和性なし、ブランド色強い |
| Mantine / Chakra UI | 規律強度が中、M3 ほどの公開情報なし |

## Emotion 隔離戦略 (将来移行容易性のため)

Emotion を「MUI の transparent backing」として隠蔽し、user code は MUI 抽象しか触らないルールを機械強制する。

| # | ルール | 機械強制 |
|---|---|---|
| 1 | styling は `sx` prop で | (人手) |
| 2 | `styled()` は `@mui/material/styles` から | lint (戦略 3) で連鎖カバー |
| 3 | `@emotion/*` の直接 import 禁止 | **oxlint** `no-restricted-imports` |
| 4 | theme tokens を `src/theme/` に集約 | (構造) |
| 5 | `createTheme()` 引数を M3 schema 準拠に | (構造) |
| 6 | `<ThemeProvider>` は `@mui/material/styles` から | lint (戦略 3) で連鎖カバー |

詳細: `lint-config/oxlint-emotion-isolation.jsonc` + CLAUDE.md `## デザイン規約 > Emotion 隔離方針`。

## 結果

### 即時 (Phase α + β + γ 経由)
- shadcn primitives (12 file) + Tailwind v4 + Radix UI 撤去
- 全 view の className → `sx` prop 書換 (約 30 file)
- `src/theme/` に M3 準拠 token + adapter 集約
- AI が判断する際 M3 docs を参照可能 (CLAUDE.md にリンク明記)
- bundle に Emotion runtime + MUI 一式が同梱 (gzip +50〜80KB)

### Phase 4 (server) 以降
- DataGrid 等 MUI X エコシステムが利用可能 (Phase E Admin で活きる)
- DatePicker / Charts / Treeview / Masonry 等の標準 component が無料

### 将来 (Pigment CSS 移行を選ぶ場合)
- 戦略 1〜6 を守ってる限り、user code はほぼ無修正
- 変更箇所: `package.json` deps 入替 + Vite plugin 追加 + root setup の `<ThemeProvider>` 周り
- adapter (`src/theme/index.ts`) で `createTheme` の差替えのみ

## 移行フェーズ

- **Phase α** (本 PR): MUI + Emotion 導入、theme/ 整備、ThemeProvider 配線、Emotion 隔離 lint、Button 1 個 spike 検証
- **Phase β** (次): 全 view を MUI 化、TanStack Form integration、Toast / Loading 系導入
- **Phase γ** (後): Tailwind / shadcn / Radix / class-variance-authority / clsx / tailwind-merge 撤去、`src/shared/ui/*` 削除

## 参考

- M3 公式: https://m3.material.io/
- MUI v7 docs: https://mui.com/material-ui/
- Emotion: https://emotion.sh/docs/introduction
