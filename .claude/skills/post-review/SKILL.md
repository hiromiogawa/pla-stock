---
name: post-review
description: レビュー指摘への対応（failure-record で失敗記録 → rule-cycle でルール改善）を統括する。Use when コードレビューの指摘を受け取った直後、対応と再発防止の流れを開始するとき
metadata:
  kind: orchestrator
  subskills: [dev-complete, failure-record]
  trigger: コードレビューの指摘を受け取った直後、対応と再発防止の流れを開始するとき
---

# レビュー後対応

コードレビューの指摘を受けた後の対応を統括する。

## いつ使うか

- コードレビューで指摘を受けたとき
- superpowers:receiving-code-review の後に実行する

## 実行フロー

### Step 1: 指摘の分類

レビュー指摘を以下に分類する:

- **修正必須**: バグ、セキュリティ、設計上の問題 → 即座に修正
- **改善提案**: リファクタ、命名改善 → 判断して対応
- **エージェントのミス**: ルール違反、コンテキスト不足による誤り → failure-record 対象

### Step 2: 修正の実施

指摘に対応し、**REQUIRED SUB-SKILL:** dev-complete の Step 1-3（self-review subagent dispatch → docs-freshness → conventional-commits）を再実行する。Step 1 の self-review は Agent tool で subagent dispatch される (詳細は dev-complete skill / `.claude/agents/self-review.md`)。

> **注 (#177 slash 化後)**: `dev-complete` は `disable-model-invocation: true` で slash 化済 (AI 直接起動不可)。post-review からの sub-skill 呼出は、**ユーザーに `/dev-complete` 入力を依頼** して skill 内容を context に展開させてから順次実行する。post-review 自体の slash 化は将来検討 (#158 Step 2.1 候補)。

### Step 3: failure-record（失敗記録）

エージェントのミスに該当する指摘があった場合、**REQUIRED SUB-SKILL:** failure-record を実行する:

1. ADR-0007 に FAIL エントリを追記
2. 該当スキル/CLAUDE.md にルールを反映
3. rule-cycle を呼び出す（閾値チェック付き）

### Step 4: rule-cycle（改善サイクル）

**REQUIRED SUB-SKILL:** failure-record が rule-cycle を呼び出し、閾値に達していればサイクルが自動実行される。

### 完了条件

- [ ] レビュー指摘に全て対応済み
- [ ] self-review subagent dispatch 再実行パス (Markdown 要約を確認、findings 修正済)
- [ ] エージェントのミスがあれば failure-record 済み
