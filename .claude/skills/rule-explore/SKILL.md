---
name: rule-explore
description: rule-explore subagent (.claude/agents/rule-explore.md) の dispatch reference。探索本体は subagent に集約。Use when rule-cycle オーケストレーターから rule-measure 直後に subagent dispatch する手順を確認するとき
metadata:
  kind: atomic
  trigger: rule-cycle オーケストレーターから rule-measure 直後に subagent dispatch する直前
---

# rule-explore (dispatch reference)

探索本体 (skill / agent 間の矛盾・重複 / 依存ルールのスコープ漏れ / 未ルール化パターン / アーカイブ候補) は `.claude/agents/rule-explore.md` subagent に集約済。本 skill は **dispatch 手順の参考書**。

## dispatch 方法

`rule-cycle` skill の Step 2 が Agent tool 経由で自動 dispatch するのが正規。手動で叩く場合の手順:

1. 親 prompt に **rule-measure subagent の計測要約 (Markdown)** を注入
2. Agent tool を起動、`subagent_type: rule-explore`
3. 返却された Markdown 要約 (探索結果) を次ステップ rule-improve に渡す

## なぜ subagent か

- 全 skill / agent ファイル grep + PR / commit history 調査は重く、親 context を圧迫する
- 数値で見えない問題の発見は「新鮮な目」で skill 同士を読み比べる subagent context が有効
