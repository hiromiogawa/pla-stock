---
name: project-bootstrap
description: project-bootstrap subagent (.claude/agents/project-bootstrap.md) の dispatch reference。生成サイクル本体は subagent に集約。Use when 新規プロジェクトを dev-skills 標準でブートストラップするとき
metadata:
  kind: atomic
  trigger: 新しいリポジトリを作成し dev-skills 標準でブートストラップするとき
---

# project-bootstrap (dispatch reference)

新規 repo の bootstrap (Biome / OXLint / knip / dep-cruiser / husky / Issue template / docs/ / CLAUDE.md 生成) は `.claude/agents/project-bootstrap.md` subagent に集約済。本 skill は **dispatch 手順の参考書**。

## いつ使うか

新規 repo を dev-skills 標準で初期化するとき (pla-stock の現状 bootstrap 済 state を fixture とした dry-run も subagent 対応)。

## dispatch 方法

1. ターゲット repo に `.project-config.yml` を配置 (project / coverage / architecture / scopes 等を記述)
2. Bash で先に `git init` / `pnpm init` を実施 (不可逆操作は subagent 範囲外)
3. Agent tool を起動、`subagent_type: project-bootstrap`、prompt に次を含める:
   - `.project-config.yml` の内容 (raw YAML)
   - ターゲット repo path
   - 既存ファイル取扱い (`skip-existing` or `overwrite`)
   - 期待出力フォーマット (subagent 側「出力フォーマット」に従う)
4. 返却された Markdown 要約を確認、確認事項チェックリストを順次実施
5. 必要なら subagent を再 dispatch (生成 fail / 一部だけ生成失敗等)

## なぜ subagent か

- Write tool が必要 (大量 config / skill / docs ファイル生成)
- 大量の生成 output を独立 context に閉じ込めて親 context のサイズを節約
- 新規 repo 立ち上げという 1 回限りの作業のため、独立 context での隔離が安全 (誤って既存 repo を上書きするリスクの低減)

## 実機検証

subagent の実機検証は **次回新規プロジェクト立ち上げ時** に実施 (Issue #188 のスコープ記述通り)。pla-stock 上での dry-run mode は subagent 側でサポート。

## Red Flags — STOP

- 「subagent dispatch せず Skill 経由で手作業生成」→ 独立 context の利点 (大量 output 隔離 / Write 範囲限定) が崩れる
- 「`.project-config.yml` を渡さず subagent dispatch」→ scopes / architecture / coverage 値が決まらず scaffold が hardcode 化、再利用性が損なわれる
- 「不可逆操作 (`git init` / `pnpm install`) を subagent にやらせる」→ rollback 不能な操作は親 context が責任を持って実施する
