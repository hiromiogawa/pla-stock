# commit

pla-stock の commit message 規約。Conventional Commits + scope-enum 厳密化。commitlint で機械強制 (`commit-msg` hook + CI)。

## 形式

```
type(scope): subject

body (optional, 日本語 narrative OK)

Refs/Closes #NNN (footer)

Co-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## type

`@commitlint/config-conventional` の標準セット (`feat` / `fix` / `docs` / `chore` / `refactor` / `style` / `test` / `perf` / `build` / `ci` / `revert`) を採用。各 type の定義は **Conventional Commits 公式** 参照:

- 仕様: <https://www.conventionalcommits.org/>
- type 一覧: <https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional>

pla-stock 固有の運用ルール:

- `docs` は本 repo では「docs/ 直下 + CLAUDE.md + docs/rules/ + docs/adr/」変更で使う (scope は `docs`)
- `chore` は依存更新 (`scope: deps`) や CI 以外の tooling 変更 (`scope: tooling`) で使う

## scope (`.project-config.yml` enum、commitlint 機械強制)

scope は **`.project-config.yml` の `scopes` フィールドが SSoT** (カテゴリ分類: Domain / FSD layer / Cross-cutting のコメント付き)。`lint-config/commitlint-config.cjs` の `scope-enum` で同 enum を機械強制。

scope 追加 / 変更時は `.project-config.yml` と `lint-config/commitlint-config.cjs` の両方を更新する (二重保守だが commitlint の制約)。

## subject

- **日本語 narrative OK** (`subject-case` を無効化)。例: `feat(views): KitDetail loader を Promise.allSettled で部分失敗対応`
- 型 / クラス / 関数名等のコード内識別子は英語のまま
- `type(scope): description` のヘッダは **100 文字以内** (commitlint `header-max-length`)

## body / footer

- body は日本語 narrative OK、複数段落 / 箇条書きで「why」を中心に
- 関連 Issue は `Refs #NNN` (本 PR で完結しない) or `Closes #NNN` (PR merge で close)
- AI 共著は `Co-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` (footer)

## branch との関係

branch 命名規約は [branch.md](./branch.md) 参照。

## NG 例 / 対処

| NG | 理由 | 対処 |
|---|---|---|
| `update something` | type / scope なし | `feat(views): ...` のように type(scope) 必須 |
| `feat(adr): ...` | `adr` は scope-enum にない | `docs(docs): ...` 等の許可 scope を使う |
| header 121 chars | `header-max-length: 100` 違反 | subject を短縮 (要約は body に書く) |
| 英語 only | narrative は日本語推奨 | body は日本語で書き直す |

## 関連

- 設計経緯: ADR-0001 (tooling 採用、commitlint 導入時)
- 機械強制実装: `lint-config/commitlint-config.cjs`、`.husky/commit-msg`
- scope enum SSoT: `.project-config.yml` の `scopes` フィールド (必ず commitlint-config と同期)
- branch 命名: [branch.md](./branch.md)
