---
description: ルール改善サイクル（rule-measure → rule-explore → rule-improve → rule-audit）を順次実行する
metadata:
  kind: orchestrator
  subskills: [rule-improve, rule-audit]
  subagents: [rule-measure, rule-explore]
  trigger: ユーザーが /rule-cycle で明示起動するとき (failure-record 追記直後 or 「ルールを改善して」依頼時)
---

# ルール改善サイクル

rule-measure → rule-explore → rule-improve → rule-audit を順次実行するオーケストレーター。

## いつ使うか

- failure-record スキルで FAIL エントリを追記した後（閾値チェック付き）
- 手動で「ルールを改善して」「ルールの効果を確認して」と依頼されたとき

## 実行フロー

### 1. 閾値チェック（failure-record からの呼び出し時）

1. CLAUDE.md の記憶 (file memory) ルールに従い、ファイル memory の `rule-cycle-meta` エントリを読む
   （無ければ「前回 FAIL 総数 = 0」＝初回扱い）
2. 現 FAIL 総数を取得:
   `grep -c "^### FAIL-" docs/adr/0007-agent-failure-rules.md`
3. **現総数 − cycle-meta 記録値 ≥ 3**: サイクル本実行。**< 3**: 「FAIL 総数 N 件。
   閾値 3 件まであと M 件。」と報告して終了
4. **手動呼び出し時**: 閾値チェックをスキップし即サイクル実行

### 2. サイクル実行

以下を **この順番で** 実行する。各ステップの完了を確認してから次に進む。

#### Step 1: rule-measure（計測） — subagent dispatch

**REQUIRED SUBAGENT:** Agent tool で `rule-measure` subagent を dispatch する。親 prompt 構成:

1. 前回サイクル基準値 (file memory `rule-cycle-meta`、無ければ「初回」)

subagent が ADR-0007 の失敗履歴、git log、skill / agent 総数を独立 context で集計し、効果スコアを算出。返却された Markdown 要約を Step 2 の親 prompt に引き継ぐ (= 連鎖型 dispatch)。

#### Step 2: rule-explore（探索） — subagent dispatch

**REQUIRED SUBAGENT:** Agent tool で `rule-explore` subagent を dispatch する。親 prompt 構成:

1. **Step 1 で取得した rule-measure 計測要約** (Markdown を全文注入)

subagent が skill / agent 間の矛盾・重複、依存ルールのスコープ漏れ、未ルール化パターン、アーカイブ候補を独立 context で探索。返却された Markdown 要約を Step 3 の親 prompt に引き継ぐ。

#### Step 3: rule-improve（改善提案）

**REQUIRED SUB-SKILL:** rule-improve を実行する。Measure + Explore の結果から改善提案を GitHub Issue として起票する。ファイルは変更しない。

#### Step 4: rule-audit（検証）

**REQUIRED SUB-SKILL:** rule-audit を実行する。Improve が起票した Issue を精査し、承認（`approved` ラベル）またはクローズする。サイクルメタ（rule-cycle-meta）をファイル memory に upsert する。

### 3. 完了報告

サイクル完了後、以下を報告する:

- 計測結果のサマリ（FAIL 総数、新規件数、効果スコア）
- 探索で見つかった問題（矛盾、重複、未ルール化パターン）
- 起票された Issue 一覧
- Audit の結果（承認/却下）

## 注意事項

- 各ステップは順次実行する（並列不可）。前ステップの出力が同一セッションのコンテキストで次ステップの入力になるため。
- サイクル中にエラーが発生した場合、そのステップで停止し、エラー内容を報告する。中断時は cycle-meta が未更新のため、次回は measure から再実行する（二重カウントは起きない）。
- Improve が「提案なし」と判断した場合、Audit はスキップする。
