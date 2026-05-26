# pla-stock rules

pla-stock の **現状の運用手順・アーキテクチャ・規約** を topic ごとに集約した SSoT。人間 + AI 両方が読む。

設計判断の **歴史と経緯** は `docs/adr/` (不変、追記のみ)。本 rules は現在形で「今どうやっているか」を示す。

## 索引

| Topic | 内容 |
|---|---|
| [architecture.md](./architecture.md) | FSD レイヤー責務 + 依存ルール + Container/Hook/Presenter |
| [ui-patterns.md](./ui-patterns.md) | Form / Toast / Loading / Emotion 隔離 |
| [domain-modeling.md](./domain-modeling.md) | Drizzle schema SSoT / entity 組織 / timestamp 種別 |
| [linting.md](./linting.md) | 型アサーション / 三項ネスト / 1 文字変数 / any 4 ルール |
| [code-quality.md](./code-quality.md) | lint / format / pre-commit / CI gate |
| [commit.md](./commit.md) | Conventional Commits / scope / header limit |
| [branch.md](./branch.md) | branch naming / github-flow / Issue 階層 / PR↔Issue |
| [issue.md](./issue.md) | Issue Type 別 (Epic/Task/Story/Bug/Subtask) 書き方 |
| [testing.md](./testing.md) | Testing Trophy / factory / coverage gate |
| [adr-policy.md](./adr-policy.md) | ADR 書き方 + 「ADR→実装→rules 更新」徹底 |
| [docs-policy.md](./docs-policy.md) | docs/ 構造 + SSoT 境界 (ADR-0018 現状形) |
| [skill-authoring.md](./skill-authoring.md) | skill 規約 (orchestration 専念原則) |

## 規約変更 workflow (徹底)

新規規約 / 規約変更は以下の順で必ず実施 (ADR-0018):

1. **ADR に記録** (`docs/adr/NNNN-xxx.md`): 設計判断と経緯を残す
2. **実装**: コード / lint-config / tooling 設定で実体化
3. **docs/rules/ を更新**: 現状形の規約として該当 topic ファイルに反映 (新規 topic なら新規ファイル)

ADR 不在で rules だけ更新は反パターン (経緯が失われる)。ADR を書いて rules を放置も反パターン (現状形が古いまま残り、人間 / AI が古い情報を読む)。

## 関連

- `docs/adr/` — 設計判断の歴史 + 最終決定 (不変、追記のみ)
- `docs/adr/0018-ssot-boundary.md` — SSoT 境界規約 (本 rules の存在根拠)
- `docs/adr/0007-agent-failure-rules.md` — AI agent 失敗事例 live log
- `docs/specs/` — ADR より動く前提の仕様 (design-direction 等)
- `docs/harness-map.md` — ハーネス全体俯瞰
- `lint-config/` — 機械強制規約の SSoT (例外、md で表現不能)
- `CLAUDE.md` — 目次 + AI 固有規律 (skill 起動規律 / Red Flag / verify:ui)
