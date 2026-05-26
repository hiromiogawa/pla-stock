# ADR-0019: View Container/Hook/Presenter 分離 (retroactive)

- ステータス: 承認 (retroactive 記録)
- 日付: 2026-04-29 (PR #51 merged 日、Issue #43 を close)
- 関連: Issue #43、PR #51、#155 (paper tiger 部分解消)、#218 (depcruise rule 導入)、Issue #217 (named import 禁止 OSS 検討)、ADR-0018 (SSoT 境界規約)

## 文脈

mutation や 3 個以上の useState、async handler を持つ view を **Container (route file) / Hook (`useXxx.ts`) / Presenter (`XxxView.tsx`)** に分離する規約。PR #51 で 5 view を本パターンに移行して規約確立 (Issue #43)。当初は CLAUDE.md のみで管理されていたが、ADR-0018 (SSoT 境界規約) に従い retro 記録。

## 決定

- **Container = route file**: `Route.useLoaderData()` → `useXxx(input)` → `<XxxView {...data} {...hookProps} />`
- **Hook = `useXxx.ts`**: state + handler + `router.invalidate()` で loader 再取得
- **Presenter = `XxxView.tsx`**: pure (props in / JSX out のみ)。`useState` / `useEffect` / mutation 直呼び禁止
- **List view (filter state のみ) は inline 維持 OK**: `useXxxList` hook 化までは不要 (filter state はその View でしか使わない)

### 強制方法

| レイヤー | 強制方法 | 状態 |
|---|---|---|
| View 本体 (`*View.tsx`) → `~/features/*` 直 import 禁止 | depcruise rule `fsd-view-component-no-features-direct` | 機械強制 (CI / pre-commit、PR #218 で導入) |
| ライブラリ設計の自然誘導 (TanStack Router の `useLoaderData` は route 階層 = Container でしか呼べない) | フレームワーク仕様 | 構造的に守られる |
| `*DetailView.tsx` 等で react の `useState` / `useEffect` / `useReducer` named import 禁止 | review 担保 | 意識的選択 (Issue #217 で OSS 検討中) |

## 結果

- View 純粋性が機械強制 (View → features 直 import 検出)
- 未強制範囲 (named import) は意識的な review 担保で運用
- 将来 OSS で named import 禁止が確立したら本 ADR を supersede する新 ADR を立てる

## 代替案

- (a) `scripts/check-view-purity.mjs` の custom regex script: 腐敗リスク (regex 場当たり / IDE squiggle なし / oxlint 外で進化享受できない) から却下 (#155 で議論済)
- (b) eslint plugin 自作: メンテ負荷、却下
