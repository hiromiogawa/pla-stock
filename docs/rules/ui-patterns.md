# ui-patterns

pla-stock の UI 実装パターン規約。MUI v7 + Emotion を採用 (ADR-0002)、Material Design 3 ガイドライン準拠。

## Form パターン

Form は **TanStack Form + MUI TextField/Select** で実装。`<FormTextField field={...} />` / `<FormSelect field={...} options={...} />` 経由で統一する。

詳細・採用経緯: ADR-0003 (TanStack Form + MUI integration パターン)。

## Toast 通知

mutation 成功 / 失敗、検証エラー等は **notistack の Snackbar** で通知:

- React コンポーネント内: `const { enqueueSnackbar } = useSnackbar()`
- 非 React 文脈 (loader / route handler): `import { enqueueSnackbar } from 'notistack'`
- variant: `'success' | 'error' | 'warning' | 'info' | 'default'`
- **`window.alert` / `console.warn` を user-facing 通知に使わない** (debug 用は OK)

## Loading 表示

- **route 遷移中の loader 待機**: TanStack Router の `pendingComponent` で画面上部に MUI `<LinearProgress>` を表示
- **mutation 中の button**: `disabled + <CircularProgress size={16} />` パターン (既存実装のまま継続)

## Emotion 隔離 (6 ルール)

MUI v7 の内部 engine (Emotion) を user code から隠蔽し、engine 切替時の書換コストを最小化:

| # | ルール | 強制 |
|---|---|---|
| 1 | styling は MUI の `sx` prop で | review |
| 2 | `styled()` は `@mui/material/styles` から (NEVER `@emotion/styled`) | review |
| 3 | `@emotion/*` の直接 import 禁止 | **oxlint 機械強制** (`lint-config/oxlint-emotion-isolation.jsonc`) |
| 4 | theme tokens は `src/theme/` に集約 (engine 非依存の plain TS object) | review |
| 5 | `createTheme()` 引数は M3 schema 準拠 | review |
| 6 | `<ThemeProvider>` は `@mui/material/styles` から (NEVER `@emotion/react`) | review |

設計経緯: ADR-0020。

## デザインシステム

UI 判断ルールは **Material Design 3** ガイドライン (https://m3.material.io/)。優先順:

1. **M3 ガイドライン** (色の意味論、コンポーネント階層、state layer)
2. **MUI docs** (https://mui.com/material-ui/ 具体 API)
3. **`src/theme/tokens.ts`** (M3 準拠の token 実体)

pla-stock のデザイン方向性 (Tone / Differentiation 等) は `docs/specs/2026-04-29-design-direction.md` に確定 (Refined Minimalism + 塗料 color swatch 差別化、primary は M3 green)。

UI コード変更前 (`.tsx` の styling / sx prop / 新規 component) は必ず `frontend-design` skill を invoke する (CLAUDE.md「AI 固有規律」参照)。

## 関連

- 設計経緯: ADR-0002 (MUI 採用)、ADR-0003 (Form)、ADR-0020 (Emotion 隔離)
- デザイン仕様: `docs/specs/2026-04-29-design-direction.md`
- 機械強制実装: `lint-config/oxlint-emotion-isolation.jsonc` (Emotion ルール 3)
- theme 実装: `src/theme/tokens.ts`、`src/theme/index.ts`
