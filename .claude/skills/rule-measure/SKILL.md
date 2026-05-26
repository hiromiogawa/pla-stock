---
name: rule-measure
description: rule-measure subagent (.claude/agents/rule-measure.md) の dispatch reference。計測本体は subagent に集約。Use when rule-cycle オーケストレーターから subagent dispatch する手順を確認するとき
---

# rule-measure (dispatch reference)

計測本体 (FAIL 集計 / 効果スコア / git log 傾向 / skill 数) は `.claude/agents/rule-measure.md` subagent に集約済。本 skill は **dispatch 手順の参考書**。

## dispatch 方法

`rule-cycle` skill の Step 1 が Agent tool 経由で自動 dispatch するのが正規。手動で叩く場合の手順:

1. 親 prompt に「前回サイクル基準値」(file memory `rule-cycle-meta`、無ければ「初回」と明示) を含める
2. Agent tool を起動、`subagent_type: rule-measure`
3. 返却された Markdown 要約 (計測結果) を次ステップ rule-explore に渡す (rule-cycle が自動連鎖)

## なぜ subagent か

- 大量の grep / git log 出力を独立 context に閉じ込め、親 context のサイズを節約
- 計測の中立性 (親の編集 context のバイアスから分離)

## file memory との関係

`rule-cycle-meta` の **更新は rule-audit が行う**。本 skill / subagent は読むだけ。
