---
name: docs-freshness
description: ドキュメントを Why / What / How に分類し、陳腐化しやすい What を自動生成に寄せて鮮度を担保する方針を定める。Use when ドキュメントを追加・更新するとき、生成物と手動ドキュメントの役割分担に迷ったとき、または CI / pre-push hook の docs 差分チェックが失敗したとき
---

# ドキュメント鮮度管理

ドキュメントを Why / What / How に分類し、陳腐化しやすい What はコードから自動生成することで鮮度を担保する。

## 原則

すべてのドキュメントを 3 つのカテゴリに分類し、それぞれ異なるメンテナンス戦略を適用する。

| カテゴリ | 内容 | メンテナンス方法 |
|---|---|---|
| **Why** | 設計判断、技術選定の理由、却下された代替案 | ADR (`docs/adr/`、不変記録) |
| **What** | API 仕様 / skill 一覧 / ADR index 等、コードや skill ファイルから機械的に導ける情報 | スクリプトで自動生成、drift を hook / CI で検出 |
| **How** | セットアップ手順、CI 設定、運用方法 | 変更時に手動更新 |

## What: 自動生成 (現状 pla-stock 配線)

| 生成物 | 生成スクリプト | drift 検出 |
|---|---|---|
| `docs/adr/README.md` | `pnpm gen:adr-index` | `pnpm gen:adr-index --check` (pre-push hook で機械強制) |

drift 検出が落ちた場合は対応するスクリプトを実行してコミット (`pnpm gen:adr-index`)。

> NOTE: skill / command 一覧は Claude Code が session 開始時に system-reminder で
> context 注入する。手動 CLAUDE.md トリガー表生成は #227 で廃止
> (paper tiger リスク回避、俯瞰用途は #229 drawio に集約)。
>
> 将来 typedoc / dependency-graph の自動生成を追加する場合は
> `docs/generated/` ディレクトリを切り、同じ drift 検出パターンを踏襲する。

## Why: 設計記録

- 「A vs B」の判断 → `docs/adr/` に ADR を作成 (`design-decision` orchestrator は slash 化済、ユーザーに `/design-decision` を依頼)
- 却下された代替案に注力（コードからは導出できない情報）
- ADR は不変記録、後から「supersede」する場合も旧 ADR は残す

## How: 手動ドキュメント

- README / CLAUDE.md の手動セクション / `docs/harness-map.md` 等
- プロセスが変わったときに更新
- 自動生成域 (What) と混ぜない (rebuild で吹き飛ぶ)

## PR チェックリスト

PR 作成前に以下を確認 (本リスト自体は dev-complete subagent dispatch / pre-push hook で機械化済の項目を含む):

- [ ] ADR を追加・編集した場合、`pnpm gen:adr-index` の再生成が必要か (pre-push で drift 検出されるが、事前実行で hook reject を防げる)
- [ ] 設計判断に対して ADR を追加したか (Why のメンテ)
- [ ] プロセス変更があった場合、How ドキュメント (README / CLAUDE.md 該当節) を更新したか

## アンチパターン

- 「コードを見れば分かる」 → ならドキュメント化しない。JSDoc + 自動生成に任せる。
- 「陳腐化するかも」 → 自動生成するか、書かない。
- **「機械強制と謳って実体がない」** → paper tiger。新規 generator を追加する時は drift 検出 hook も同 PR で配線する (`claude-handbooks:writing-skills` の「機械強制併設原則」)。
