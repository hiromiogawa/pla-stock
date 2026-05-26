---
name: writing-issues
description: GitHub Issue を Type 別 (Epic/Task/Story/Bug/Subtask) に日本語で起票する規約を docs/rules/issue.md から参照して適用する. Use when 新規 Issue を立てる時、既存 Issue を整える時、Epic に sub-issue をぶら下げる時
---

# Issue 起票

orchestration only。規約本文は `docs/rules/issue.md` を参照。

## 起動規律

Issue 起票直前に Skill ツールで本 skill を invoke する。

## 実行フロー

1. `docs/rules/issue.md` を読む
2. Type (Epic / Task / Story / Bug / Subtask) を判定
3. `.github/ISSUE_TEMPLATE/<type>.yml` を経由して起票 (`gh issue create --template <type>`)
   - 一発起票: `gh issue create --title "[Type] ..." --label <type> --body "..."`
4. タイトル: `[Type] <要約>` 日本語、40 字以内目安
5. 親子紐付け: Epic → 子 Issue は sub-issue 機能で紐付け (`gh issue edit <child> --add-parent <parent>`)
6. ラベル必須 (`epic` / `task` / `story` / `bug` / `subtask`)、Projects 集計に影響

## アンチパターン

- タイトルが「修正」「改善」と漠然 → 動詞 + 対象を具体化
- 受け入れ条件が「動くこと」だけ → 外形検証できる粒度に分解
- 親 Epic 未指定の Task 乱立 → 先に Epic を立てる or 独立 Task の理由を本文に
- ラベル付け忘れ → template 経由なら自動、手起票なら `--label` 必須
- Bug の再現手順なし → 最低 1 回再現できる手順を書く
- Story を「実装する」目線で書く → ユーザー目線で書き直す

詳細は [docs/rules/issue.md](../../../docs/rules/issue.md) のアンチパターン節。

## 参照

- 規約本文: [docs/rules/issue.md](../../../docs/rules/issue.md)
- 関連: [docs/rules/branch.md](../../../docs/rules/branch.md) (PR↔Issue 1:1)
- Issue テンプレート実体: `.github/ISSUE_TEMPLATE/*.yml`
