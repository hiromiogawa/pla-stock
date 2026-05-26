---
description: 実装完了時の仕上げ（self-review subagent dispatch → docs-freshness → conventional-commits → PR 作成）を統括する
---

# 開発完了

実装が終わったとき、コミット・PR作成までの仕上げを統括する。

## ⚠ 起動規律 (FAIL-002 由来 / ADR-0007)

**このコマンドの内容が context に表示された = ユーザー明示 `/dev-complete` で起動された証跡**。手順を最初から省略せず踏むこと。

コマンド内の検証コマンド (`pnpm check:parallel` 等) を直接走らせるだけでは **本コマンド起動の代替にならない**。本コマンドは Step 1 で `self-review` **subagent を Agent tool で dispatch** し、Step 2-4 で docs-freshness / conventional-commits / github-flow を **REQUIRED SUB-SKILL として連鎖呼出** する設計。`/dev-complete` 起動経由でないと連鎖が起きず工程が抜ける。

「コマンドは走らせたから手順は把握してる」「軽微な変更だから略式で OK」は省略合理化のサイン。Red Flag が浮かんだら STOP し、ユーザーに `/dev-complete` 再入力を依頼 (内部で `self-review` subagent を Agent dispatch) する。

## いつ使うか

- 実装が一段落したとき（「実装できた」「テスト通った」）
- superpowers:verification-before-completion と併用する

## 実行フロー

### Step 1: self-review subagent dispatch — **必須・省略不可**

**REQUIRED SUBAGENT:** Agent tool で `self-review` subagent を dispatch する。親 context で diff を Read しない (subagent が独立 context で再読することで「新鮮な目」を担保するのが本機構の核心)。

#### 親 prompt の構成

1. `git diff origin/main...HEAD` の出力 (Bash で取得して prompt に注入)
2. PR コンテキスト (Issue # / 主旨)
3. 本 PR で導入した「機械強制」言及箇所のリスト (paper tiger チェック用、無ければ「該当なし」と明示)
4. 期待する出力: subagent 側の出力フォーマット (Markdown 要約) に従う

#### 結果の取り扱い

- subagent が返した Markdown 要約を確認
- findings あれば親が修正を実施 → commit → 再度 subagent dispatch (= 修正後の差分で再検証)
- 全 pass したら次の Step に進む
- subagent 要約は最終的に `gh pr comment` で PR に記録 (= 監査 trail)

この Step を省略することは許されない。CI が落ちる / レビュアーが気づくより前に自分で気づくのがセルフレビューの目的。「時間がない」「小さい変更」「CI が走るから」は全て無効な言い訳。

### Step 2: docs-freshness（ドキュメント確認）

**REQUIRED SUB-SKILL:** docs-freshness に従い:

1. 変更したコードに関連するドキュメントがあるか確認
2. 型定義を変更した場合は JSDoc も更新されているか確認
3. 自動生成ドキュメント（mcp-tools.md, dependency-graph.svg）の再生成が必要か確認

### Step 3: conventional-commits（コミット）

**REQUIRED SUB-SKILL:** conventional-commits に従い:

1. 変更をステージング
2. `type(scope): description` フォーマットでコミット
3. scope は `.project-config.yml` の `scopes` フィールドを参照（例: `kit` / `paint` / `views` / `docs` 等）

### Step 4: github-flow（PR作成）

**REQUIRED SUB-SKILL:** github-flow に従い:

1. ブランチをプッシュ
2. PR を作成（関連 Issue を Closes で紐付け）
3. レビューを依頼

### 完了条件

- [ ] self-review subagent を **Agent ツールで dispatch** し、全パスを確認 (親 context で diff Read 禁止)
- [ ] subagent が返した Markdown 要約の findings を確認、必要なら修正 → 再 dispatch
- [ ] **subagent 要約を `gh pr comment` で PR に記録** (= 監査 trail 必須)
- [ ] ドキュメント更新確認済み
- [ ] Conventional Commits でコミット済み
- [ ] PR 作成済み（Issue 紐付け済み）
- [ ] PR 作成後にもう一度 self-review subagent を dispatch し、push 時点の差分が全パスすることを確認

## Red Flags — STOP

以下の思考パターンが浮かんだら STOP。セルフレビューをスキップしようとしているサイン:

| 合理化 | 実態 |
|---|---|
| 「small diff だから verify だけで良い」 | small diff こそ見落としが致命傷になる |
| 「CI が走るから手元は飛ばす」 | CI は最後の砦であって一次チェックではない。手元で気づくほうがループが短い |
| 「さっき走らせたから PR 直前は不要」 | commit → push の間に追加 edit が入りうる。push 時点の差分で再検証する |
| 「ユーザーに確認されるから後で直せる」 | ユーザーが検出する前に自分で検出するのがセルフレビューの定義 |
| 「self-review コマンドを呼ばなくても手でコマンド打てば同じ」 | コマンドを明示起動することで「やった証拠」と次のチェックリストが残る。手作業だと省略が混入する |
| 「親 context で diff を Read してから dispatch すれば速い」 | 新鮮な目が崩れる。親は diff を Bash で取って prompt に注入するだけ、Read しない |
| 「subagent dispatch なしで Skill 起動した self-review でも十分」 | 親 context のバイアスが残る、新鮮な目が成立しない (本機構導入の趣旨に反する) |
