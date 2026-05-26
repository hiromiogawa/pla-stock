# ADR-0020: Emotion 隔離方針 (6 ルール、retroactive)

- ステータス: 承認 (retroactive 記録)
- 日付: 2026-04-28 (ADR-0002 と同日 = MUI 採用と同時に確立)
- 関連: ADR-0002 (MUI v7 採用)、`lint-config/oxlint-emotion-isolation.jsonc`、ADR-0018 (SSoT 境界規約)

## 文脈

MUI v7 採用 (ADR-0002) に伴い、内部 engine が Emotion となる。将来 Pigment CSS 等への engine 切替時の user code 書換コスト最小化が目的。user code は MUI 抽象しか触らず、Emotion 直 import を禁じる。

当初は CLAUDE.md のみで管理されていたが、ADR-0018 (SSoT 境界規約) に従い retro 記録。

## 決定 (6 ルール)

| # | ルール | 強制方法 |
|---|---|---|
| 1 | styling は MUI の `sx` prop で | review |
| 2 | `styled()` は `@mui/material/styles` から (NEVER `@emotion/styled`) | review |
| 3 | `@emotion/*` の直接 import 禁止 | **oxlint 機械強制** (`lint-config/oxlint-emotion-isolation.jsonc`) |
| 4 | theme tokens は `src/theme/` に集約 (engine 非依存の plain TS object) | review |
| 5 | `createTheme()` 引数は M3 schema 準拠 | review |
| 6 | `<ThemeProvider>` は `@mui/material/styles` から (NEVER `@emotion/react`) | review |

ルール 3 は `no-restricted-imports` で pre-commit / CI 時に reject。

## 結果

- engine 切替時の user code 影響を限定 (機械強制ルール 3 のみで Emotion 直 import を構造的に防げる)
- 残り 5 ルールは review 担保。違反は AI 失敗事例として ADR-0007 に追記

## 代替案

- (a) Pigment CSS 直接採用: SSR 制約あり当時未成熟、却下
- (b) Tailwind 維持: ADR-0002 で MUI 採用済、却下
- (c) 全ルールを機械強制: ルール 1/2/4/5/6 は意味判断を含み機械検出困難、過剰
