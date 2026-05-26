# ADR-0021: TypeScript / JS linting policy (retroactive)

- ステータス: 承認 (retroactive 記録)
- 日付: 2026-04-29 (PR #56 merged 日)
- 関連: PR #56、`lint-config/oxlint-base.jsonc`、ADR-0015 (deprecated API 検出)、ADR-0018 (SSoT 境界規約)

## 文脈

PR #56 review で型アサーション乱用と三項ネストが指摘され、oxlint で機械強制した。後続レビューで 1 文字変数 (`e`, `p`, `o` 等) と `any` 多用が指摘され同様に機械強制した。当初は CLAUDE.md のみで管理されていたが、ADR-0018 (SSoT 境界規約) に従い retro 記録。

## 決定 (4 ルール、全て `lint-config/oxlint-base.jsonc` で機械強制)

| # | rule | 内容 | 例外 |
|---|---|---|---|
| 1 | `consistent-type-assertions: never` | `value as Foo` 形の型アサーション禁止 | `as const` は許可 (TS の特殊形) |
| 2 | `no-nested-ternary` | 三項演算子のネスト禁止 | なし |
| 3 | `id-length: { min: 2, exceptions: ['_'] }` | 1 文字変数禁止 | `_` (意図的未使用の destructured 変数) |
| 4 | `typescript/no-explicit-any: error` | 関数引数 / 戻り値 / 変数注釈で `any` 禁止 | なし |

### 代替

- ルール 1: 型 narrowing (`typeof` / `in` / type guard 関数) / `as const` / `satisfies`
- ルール 2: if/return 早期 return / ヘルパ関数化 / map lookup
- ルール 3: 文脈に応じて意味のある名前 (`event` / `paint` / `option` 等)
- ルール 4: 正確な型注釈 / `unknown` + type narrowing / generics / 型 import (React の `children` は `ReactNode` 等)

### 例外運用

真にやむを得ない箇所は `// oxlint-disable-next-line <rule> -- 理由` で 1 行 disable + **理由コメント必須**。

## 結果

- レビュー指摘が機械検出され、レビュアの目検査負担が減る
- pre-commit / CI で reject されるため違反が main に入らない

## 代替案

- (a) ESLint 移行 + typescript-eslint strict preset: oxlint をパフォーマンス理由で採用済、却下
- (b) review のみで担保: 抜け漏れリスクと教育コスト、却下
