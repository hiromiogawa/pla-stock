---
name: self-review
description: self-review subagent (.claude/agents/self-review.md) の dispatch reference。検証サイクル本体は subagent に集約。Use when dev-complete から subagent dispatch する手順を確認するとき
metadata:
  kind: atomic
  trigger: dev-complete オーケストレーターから subagent dispatch する直前
---

# self-review (dispatch reference)

検証サイクル + コード re-read + paper tiger チェックの本体は `.claude/agents/self-review.md` subagent に集約済。本 skill は **dispatch 手順の参考書** に縮小されている。

## dispatch 方法

`dev-complete` skill の Step 1 が Agent tool 経由で自動 dispatch するのが正規。手動で叩く場合の手順:

1. `git diff origin/main...HEAD` を Bash で取得
2. Agent tool を起動、`subagent_type: self-review`、prompt に次を含める:
   - 取得した diff (raw)
   - PR コンテキスト (Issue # / 主旨)
   - 本 PR で導入した「機械強制」言及箇所リスト (無ければ「該当なし」)
3. 返却された Markdown 要約を確認、findings あれば親が修正
4. 修正後は再度 dispatch (= 差分が変わるたびに新鮮な目で見直す)
5. 全 pass したら subagent 要約を `gh pr comment` で PR に記録

## なぜ subagent か

「差分を新鮮な目で再読」は書いた本人 (親 context) では構造的に成立しない。subagent dispatch で独立 context にすることで初めて成立する。検証コマンドの大量 output も subagent 内に閉じ込めて親 context のサイズを節約する副次効果あり。

## paper tiger チェックの所在

subagent 側に集約。本 skill には記述を残さない (重複回避 / SSoT 一本化)。

## Red Flags — STOP

- 「subagent dispatch せず Skill 経由で検証コマンド手打ちで OK」→ 新鮮な目が崩れる、本機構の趣旨に反する
- 「subagent 要約を PR コメントに残さなくても commit log で十分」→ レビュアーが追えなくなる、監査 trail として PR コメント必須
- 「skill 内容が短いから簡略起動で OK」→ Skill tool で起動して dispatch 手順を毎回確認する規律は維持
