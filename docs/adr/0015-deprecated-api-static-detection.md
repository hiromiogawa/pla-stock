# ADR-0015: deprecated API の静的検出 (oxlint type-aware)

- ステータス: 承認
- 日付: 2026-05-22
- 関連: Issue #121 / ADR-0007 (FAIL-004) / ADR-0001 (Tooling)

## 文脈

ADR-0007 の FAIL-004 で、drizzle の `sqliteTable` 第3引数 object-style（deprecated 形式）を「既存パターン」として踏襲し見落とした。原因の一つは **機械検証の死角**:

- `tsc --noEmit` は deprecated シンボルの使用を TS6387 = **suggestion 扱い**にするため、`pnpm typecheck` / `check:parallel` をすり抜ける（error にならない）。
- `.dependency-cruiser.cjs` の `no-deprecated-core` は Node.js コア API 限定で、ライブラリ（drizzle / MUI 等）の `@deprecated` シンボルは対象外。

ライブラリ API の deprecation を pre-commit / CI で機械検出したい。

## 決定

oxlint の type-aware ルール `typescript/no-deprecated`（`@typescript-eslint/no-deprecated` の port）を採用し、`@deprecated` タグ付きシンボルの使用を静的層で検出する。

- `oxlint-tsgolint` を devDependency に追加（type-aware linting のバックエンド）。
- 専用スクリプト `pnpm lint:deprecated` = `oxlint --type-aware -A all -D typescript/no-deprecated` を追加。
- 実行層: pre-commit（`check:parallel` に並列追加）+ CI（`check` に直列追加）。pre-push は対象外。
- **スコープは deprecated 検出のみに限定する**。oxlint の `--type-aware` フラグは type-aware ルール全体（`no-floating-promises` 等）を一括有効化するため、`-A all -D typescript/no-deprecated` で対象ルールを 1 本に絞る。

採用にあたり、既存コードの違反 1 件（MUI v7 で deprecated な `PaperProps` / `AddPaintDialog.tsx`）を `slotProps.paper` へ修正した。

## 選択肢

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| A: `typescript/no-deprecated` を type-aware で deprecated のみ検出（採用） | ライブラリ deprecation を機械検出。スコープが明確 | `oxlint-tsgolint` の追加。type-aware は experimental。lint に約3秒追加 |
| B: `--type-aware` で type-aware ルール全体を採用 | 静的検証が広く強化される | #121 のスコープ超過。既存コードに別ルール違反19件、修正コスト大。別判断にすべき |
| C: `tsc` の deprecated を error 化 | 新規依存ゼロ | 技術的に不可能（TS6387 を error 化するフラグは存在しない） |
| D: 見送り（人間レビューのみ）| コストゼロ | 機械検証の死角が残る。FAIL-004 型の見落としを再発させうる |

## 結果

- ライブラリの deprecated API 使用が pre-commit / CI で機械検出される。FAIL-004 型の見落とし（IDE を見ないと気づけない deprecation）を静的層で捕捉。
- `pnpm lint:deprecated` は全 src（約160ファイル）で約2秒。`check:parallel` 内で並列実行のため pre-commit の体感増分はほぼなし。
- type-aware ルール全体の採用は本 ADR では見送り（選択肢 B）。将来必要になれば別 Issue / ADR で判断する。
- `code-quality` skill に deprecated 検出を 3 層運用として明記。

## 代替案

選択肢 B / C / D は上表のとおり却下。特に B は「既存パターン踏襲」改善（#120）と異なり対象が広く、19件の別ルール違反対応を伴うため #121 とは切り離した。
