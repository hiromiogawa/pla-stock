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

## 追補 (2026-05-28、ADR-0023 で named import OSS 検討結論)

本 ADR-0019 起票時 (2026-04-29、retro 記録) は「将来 OSS で named import 禁止が確立したら本 ADR を supersede する」予定だったが、Issue #217 で Phase A 事前調査 7 候補 (dependency-cruiser 拡張 / ESLint dual lint / eslint-plugin-boundaries / Steiger / eslint-plugin-import / TS barrel / custom script) を比較した結果、**OSS 採用を見送り、review 担保継続を意識的選択として明文化** する判断に至った (詳細は **ADR-0023**)。

主な要因:
- 技術的に成立する選択肢は ESLint dual lint (`no-restricted-imports` + `importNames`) のみだったが、dual lint 設定保守コスト > paper tiger 継続リスクと user 判断
- Steiger (FSD purpose-built) は 0.6.0 milestone = beta、API breaking 可能性で時期尚早
- 既存 depcruise rule `fsd-view-component-no-features-direct` で View → features 直 import は機械強制されており、named import の review 担保は補助的位置付け

これに伴い:
- 本 ADR-0019「強制方法」表 L24 の「Issue #217 で OSS 検討中」の検討は **ADR-0023 で見送り確定**
- 本 ADR-0019「結果」 L30 の「将来 OSS で named import 禁止が確立したら supersede」は、当面実現しない見込み (ADR-0023 の将来再評価トリガーが満たされた場合のみ)
- **本 ADR-0019 自体は supersede しない** (Container/Hook/Presenter 規約と enforcement 範囲 (depcruise + review 担保) は変わらないため。ADR-0023 は ADR-0019 の補完で、OSS 採用見送り判断を独立 ADR として記録)

将来 ADR-0023 の再評価トリガー (oxlint paths+importNames support / Steiger GA / 複数見落とし発生 / eslint 採用判断変化) が満たされた場合は、ADR-0023 を supersede する新 ADR を立てる (本 ADR-0019 はそのまま継続)。
