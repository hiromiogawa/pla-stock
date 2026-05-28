# ADR-0023: View 純粋性 named import 禁止 — OSS 採用見送り、review 担保継続

## ステータス

Accepted

## コンテキスト

pla-stock は Container/Hook/Presenter 規約 (ADR-0019) を採用しており、View Presenter (`src/views/**/*View.tsx`) は **pure (props in / JSX out のみ)** であることを求めている。Presenter 内での React named import (`useState` / `useEffect` / `useReducer` / `useCallback` / `useMemo` / `useRef` 等) は禁止し、state / effect / handler は同階層の `use*.ts` hook に集約する設計。

一方、機械強制状況は不完全だった (Issue #217 起票時点):

| 範囲 | 強制状態 |
|---|---|
| `*View.tsx → features/*` 直 import 禁止 | ✅ depcruise rule `fsd-view-component-no-features-direct` で機械強制 |
| **`*View.tsx` 内の React named import 禁止** | ⚠️ review 担保のみ (paper tiger 状態) |

調査済の不可選択肢:

- **oxlint 1.61** の `no-restricted-imports` で `paths + importNames` 形式が実質非動作 (ADR-0007 FAIL-005、合成違反テストで未発火を確認)
- **custom script** (`scripts/check-view-purity.mjs` 案) は腐敗リスク (IDE squiggle なし / regex 場当たり / oxlint 外で進化享受不可) のため見送り (#216 close)

本 ADR は Issue #217 (OSS 検討) で Phase A 事前調査 (7 候補) を経た上での最終判断を記録する。

## 決定

**OSS 採用を見送り、review 担保継続を意識的選択として明文化する。**

dual lint (oxlint + ESLint) 設定保守コスト > paper tiger 継続リスクと判断。FAIL-005 は ADR-0007 に既に記録済のため、再発時は claude-handbooks:failure-record + /rule-cycle で対応する運用を維持する。

## 選択肢

| 選択肢 | メリット | デメリット | 結論 |
|---|---|---|---|
| A. **ESLint dual lint** (`no-restricted-imports`) | named 確実制限、scope を View に限定可、native rule で安定 | dual lint 設定保守、CI 時間微増、eslint dev dep 追加 | 採用可だが **見送り** (本決定) |
| B. eslint-plugin-boundaries | FSD layer + named 統合制御、2026/3 active maintained | 過剰 (depcruise で layer は OK)、入れ替え ROI 低 | 却下 |
| C. Steiger (feature-sliced 公式) | FSD purpose-built、zero-config、active development | 0.6.0 milestone = beta、API breaking 可能性、本番採用時期尚早 | 却下 (時期尚早) |
| D. dependency-cruiser 拡張 (既存 stack) | 追加 install 不要、現状 layer 強制と統合 | named import 個別制限機能なし (公式 docs 確認、module/path level のみ) | **不可** (機能なし) |
| E. eslint-plugin-import + no-restricted-paths | active maintained、FSD layer 制御可 | path 制限のみ、named import 制限なし | **不可** (機能なし) |
| F. TS barrel file 強制 | 型レベル、外部依存不要 | アーキ大改修、複雑性高、ROI 低 | 却下 |
| G. Custom script (`scripts/check-view-purity.mjs`) | フル制御、追加 install 不要 | 腐敗リスク (ADR-0007 FAIL-005 教訓)、IDE squiggle なし、oxlint 外で進化享受不可 | 却下 (#216 close 済) |
| **★ 本決定: review 担保継続 + ADR で意識的選択として明文化** | コスト 0、設定保守不要、シンプル | paper tiger 継続、新規参加者見落としリスク | **採用** |

A (ESLint dual lint) は技術的に成立する選択肢だったが、user 判断で **見送り**。トレードオフ:

| 項目 | 採用 (ESLint dual lint) | 見送り (本決定) |
|---|---|---|
| paper tiger | ✅ 解消 | ❌ 継続 |
| 機械強制 scope | View 名前付き import 禁止 | なし |
| dual lint コスト | eslint config + lint-staged 配線 + CI 並走 (+5-10 秒)、view 命名 + react hook list の追従保守 | なし |
| 設定保守 | scope 限定でも継続的保守 | 不要 |

## 結果

### 反映先

- **`docs/rules/architecture.md`** L82: 「review 担保 (Issue #217 で OSS 検討中)」→ 「review 担保 (ADR-0023 で意識的選択として確定)」
- **`docs/adr/0007-agent-failure-rules.md`** FAIL-005 update note: 「Issue #217 で OSS 検討中」記述に「2026-05-28: ADR-0023 で OSS 採用見送り確定、review 担保継続を意識的選択化」を追記 (live log 性質に従う追記)

### Mitigation (review 担保継続のため)

- **CLAUDE.md / architecture.md でルール明示** (実施済): Container/Hook/Presenter 規約 + `*View.tsx` Presenter 純粋性
- **PR review (人間 + AI) で重点チェック項目**: `*View.tsx` 内の react named import を `git diff` 時 grep で確認
- **self-review subagent の re-read 観点に統合可能性**: `*View.tsx` の named import チェックを paper tiger 観点に組み込めるか `/rule-cycle` で判断 (本 ADR では運用変更まで踏み込まず方針確定のみ)
- **FAIL-005 既記録**: 再発時は claude-handbooks:failure-record skill 経由で記録 → /rule-cycle で対策再検討の動線

### 将来再評価のトリガー

以下のいずれかが満たされたら本 ADR の Supersede を検討:

- oxlint が `paths + importNames` 形式を正式 support (ADR-0007 FAIL-005 解消)
- Steiger が GA + stable API (0.x → 1.x、breaking changes 落ち着き)
- review 担保で named import 違反が複数回見落とされる (failure-record 蓄積 → rule-cycle の改善提案)
- eslint dual lint コストを呑む judgment 変化 (例: 他で eslint が必要になった場合)

### 関連

- Issue #217 (本 ADR で close)
- ADR-0007 FAIL-005 (paper tiger 検出ログ)
- ADR-0019 (Container/Hook/Presenter 規約)
- ADR-0021 (linting policy)
- 関連 file: `.dependency-cruiser.cjs` (FSD layer rule `fsd-view-component-no-features-direct`)、`lint-config/oxlint-base.jsonc`、`docs/rules/architecture.md`
- 関連 close 済 PR: #216 (custom script 案、却下)
