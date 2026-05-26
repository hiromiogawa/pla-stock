# linting

pla-stock の TypeScript / JS 言語規約 (4 ルール、全て oxlint で機械強制)。

機械強制実装: `lint-config/oxlint-base.jsonc`。pre-commit (lint-staged + check:parallel) と CI で reject。

## 4 ルール

| # | rule | 内容 | 例外 |
|---|---|---|---|
| 1 | `consistent-type-assertions: never` | `value as Foo` 形の型アサーション禁止 | `as const` (TS の特殊形) |
| 2 | `no-nested-ternary` | 三項演算子のネスト禁止 | なし |
| 3 | `id-length: { min: 2, exceptions: ['_'] }` | 1 文字変数禁止 | `_` (意図的未使用の destructured 変数) |
| 4 | `typescript/no-explicit-any: error` | 関数引数 / 戻り値 / 変数注釈で `any` 禁止 | なし |

## 代替パターン

### ルール 1 (型アサーション禁止) の代替

- **型 narrowing**: `typeof x === 'string'`, `'prop' in obj`, type guard 関数 `function isKit(x: unknown): x is Kit`
- **`as const`**: literal type 固定 (例: `['a', 'b'] as const`)、本ルール例外として許可
- **`satisfies`**: 型整合だけ確認、型は広げない (例: `const x = {...} satisfies Record<string, number>`)

### ルール 2 (三項ネスト禁止) の代替

- **早期 return**: `if (cond1) return a; if (cond2) return b; return c;`
- **ヘルパ関数**: `const result = pickResult(cond1, cond2)`
- **map lookup**: `const labels = { kit: 'キット', paint: '塗料' }; return labels[type]`

### ルール 3 (1 文字変数禁止) の代替

- 文脈に応じて意味のある名前: `e` (event) → `event`、`p` (paint/project/part) → `paint` / `project` / `part`、`o` (option) → `option`
- 例外は `_` (意図的未使用): `const [, value] = pair` (空 destructure)

### ルール 4 (any 禁止) の代替

- **正確な型注釈**: `Record<string, string>` / `Map<K, V>` 等
- **`unknown` + type narrowing**: API レスポンス等の動的データ
- **generics**: 関数 / hook の型柔軟性が必要なとき
- **型 import**: React の `children` は `ReactNode` 等、既存型を使う

## 例外運用

真にやむを得ない箇所のみ `// oxlint-disable-next-line <rule> -- 理由` で 1 行 disable + **理由コメント必須**。

```ts
// oxlint-disable-next-line consistent-type-assertions -- 3rd party API が型を returnしないため明示変換
const result = response.data as ApiKit
```

理由コメントなしの disable は review で reject。

## 関連

- 設計経緯: ADR-0021 (linting policy、PR #56 由来)、ADR-0015 (deprecated API 静的検出 = 別系統だが同 oxlint config)
- 機械強制実装: `lint-config/oxlint-base.jsonc`、`lint-config/oxlint-emotion-isolation.jsonc` (UI 規約は [ui-patterns.md](./ui-patterns.md))
- 関連 issue: PR #56 review (型アサーション + 三項ネスト指摘)、ユーザーレビュー指摘 (b) (any 多用)
