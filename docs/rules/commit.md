# commit

pla-stock の commit message 規約。Conventional Commits + scope-enum 厳密化。commitlint で機械強制 (`commit-msg` hook + CI)。

## 形式

```
type(scope): subject

body (optional, 日本語 narrative OK)

Refs/Closes #NNN (footer)

Co-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## type (Conventional Commits 標準)

`@commitlint/config-conventional` の標準セット:

- `feat` — 新機能
- `fix` — バグ修正
- `docs` — ドキュメント変更
- `chore` — その他 (依存更新 / config 等)
- `refactor` — 機能変更なしのリファクタ
- `style` — フォーマット変更のみ
- `test` — テスト追加・修正
- `perf` — パフォーマンス改善
- `build` — ビルドシステム変更
- `ci` — CI 設定変更
- `revert` — revert commit

## scope (`.project-config.yml` enum、commitlint 機械強制)

| カテゴリ | scope |
|---|---|
| Domain (MVP 範囲) | `kit` / `paint` / `project` / `stock` |
| FSD layer | `shared` / `entities` / `features` / `widgets` / `views` / `routes` |
| Cross-cutting | `auth` / `nav` / `ui` / `infra` / `deps` / `ci` / `docs` / `tooling` |

scope 追加時は `.project-config.yml` と `lint-config/commitlint-config.cjs` の両方を更新。

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
