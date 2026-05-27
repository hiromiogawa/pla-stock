# ADR-0022: claude-handbooks plugin による handbook 系 skill の切り出し

## ステータス
Accepted

## コンテキスト

Issue #180 (#158 Epic Step 5) は当初「Handbook 系 6 skill (adr / code-quality / failure-record / sdd / writing-issues / writing-project-skills) を claude-handbooks plugin として切り出し」を計画していた。

PR #234 (Issue #111、ADR-0018) で SSoT モデルが大きく変わった:

- `sdd` skill は audit で未使用判定 + 廃止
- `code-quality` / `writing-issues` / `testing` は orchestration only に rewrite され、body の半分以上が `docs/rules/*.md` を参照する形に → plugin 化すると project 固有 docs/rules/ への依存が宙に浮く

残った真の generic handbook は `adr` / `failure-record` / `writing-project-skills` の汎用 delta のみの **3 個** となった。

## 決定

以下を採用する:

1. **対象範囲**: 3 skill のみを plugin 化 (`adr` / `failure-record` / `writing-skills` rename)
2. **配置**: 新規外部 repo `github.com/hiromiogawa/claude-handbooks` (独立 repo として配布可能)
3. **移行戦略**: Approach B (shadow-then-cut、2 phase) — Phase 1 で plugin 公開、Phase 2 で pla-stock を flip
4. **配布**: self-marketplace 同梱方式 (`.claude-plugin/marketplace.json` を repo 同梱、フラット構成)。install は `claude plugin marketplace add hiromiogawa/claude-handbooks` → `claude plugin install claude-handbooks@claude-handbooks` の 2-step
5. **`writing-project-skills` の pla-stock 固有 delta**: `docs/rules/skill-authoring.md` に統合 (skill ファイルは削除)
6. **docs/rules/ 依存 skill (`code-quality` / `writing-issues` / `testing`)**: skill のまま pla-stock に残置 (plugin 化しない)

## 選択肢

| 選択肢 (移行戦略) | メリット | デメリット |
|--------|---------|----------|
| A: 一気通貫 (1 PR 同期) | 移行完了が早い、中間状態なし | cross-repo 同時性リスク高い、検証期間ゼロ |
| **B: shadow-then-cut (2 phase)** ✅ | cross-repo 依存一方向、plugin 単体検証可、各 PR 独立 | 2 PR 作業 |
| C: 内蔵 plugin → 外出し (3 phase) | 段階的、各 phase 安全網あり | phase 多い、Issue 受け入れ条件「独立 repo」未達中間状態 |

| 選択肢 (skill scope) | メリット | デメリット |
|---|---|---|
| **真の generic 3 個** ✅ | 現実的、docs/rules/ 依存問題回避 | Issue 本文の「6 個」を更新する必要 |
| 全 6 個無理矢理 | 完全切り出し | docs/rules/ への参照を plugin 側に汎用テンプレ化するのが複雑 |
| Issue クローズ + 別 Issue | 整理しなおし | 既存 Issue 整理の余分作業 |

| 選択肢 (配布) | メリット | デメリット |
|---|---|---|
| **self-marketplace 同梱** ✅ | repo 1 個で完結、tag-based version pin 可 | flat 構成で 2-step install |
| 自前 marketplace repo を別途作成 | 将来複数 plugin に対応可 | 現状 1 plugin のみで overhead 大 |
| git+url 直 install | 最もシンプル | Claude Code が未対応 (Task 0 検証で判明) |

## 結果

- 影響範囲: pla-stock の `.claude/skills/` から 3 ディレクトリ消失、`.claude/commands/` 2 ファイルが `claude-handbooks:` namespace 参照に更新
- `docs/rules/skill-authoring.md` に pla-stock 固有 delta が統合され、SSoT 境界 (ADR-0018) と整合
- 他プロジェクト転用が可能になる (Issue #180 受け入れ条件達成)
- 残る 3 個 (`code-quality` / `writing-issues` / `testing`) の plugin 化は将来課題 (docs/rules/ 抽象化が必要、別 Issue で扱う)

## 関連

- Issue #180 (本切り出しタスク、Closes)
- Epic #158 Step 5 (Handbook 系 skill 機構仕分け)
- ADR-0018 (SSoT 境界規約)
- PR #234 (Issue #111、本 ADR の前提変化を生んだ multi-SSoT 整理)
