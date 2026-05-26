---
name: conventional-commits
description: Conventional Commits のコミットメッセージとブランチ名規約を docs/rules/ から参照して適用する。Use when コミットメッセージを書くとき、ブランチを作成するとき、または type/scope/命名規則に迷ったとき
---

# Conventional Commits とブランチルール

orchestration only。規約本文は `docs/rules/commit.md` (コミット規約) + `docs/rules/branch.md` (ブランチ命名) を参照。

## 起動規律

コミット直前 / ブランチ作成直前に Skill ツールで本 skill を invoke する。本 skill の内容が context に表示された = 起動された証跡。

## 実行フロー

### コミットメッセージ作成時

1. `docs/rules/commit.md` を読む
2. 該当 type (`feat` / `fix` / `docs` / `refactor` / `chore` / `test` 等) と scope (`.project-config.yml` の `scopes` enum) を選ぶ
3. header は **100 文字以内**、subject は日本語 narrative OK
4. body は「why」中心の日本語、関連 Issue は `Refs #NNN` or `Closes #NNN` (footer)
5. AI 共著は footer に `Co-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`

### ブランチ作成時

1. `docs/rules/branch.md` を読む
2. 形式 `[prefix]/#[issue]-[description]` (prefix は `.project-config.yml` の `branch.prefixes` enum)
3. main / master 直編集禁止、先に Issue を作る

## 機械強制

- `lint-config/commitlint-config.cjs` (scope-enum、header-max-length: 100)
- `.husky/commit-msg` で commitlint 実行
- `.husky/pre-commit` の `scripts/check-branch.mjs` でブランチ名検証

違反すると commit / push が reject される。

## 参照

- 規約本文: [docs/rules/commit.md](../../../docs/rules/commit.md), [docs/rules/branch.md](../../../docs/rules/branch.md)
- 機械強制実装: `lint-config/commitlint-config.cjs`, `scripts/check-branch.mjs`
- scope SSoT: `.project-config.yml`
