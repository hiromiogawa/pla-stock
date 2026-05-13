# ADR-0006: Drizzle ORM + Cloudflare D1 採用

- ステータス: 承認
- 日付: 2026-05-13
- 関連: Epic #5、ADR-0008 (entity schema SSoT 規約)

## 文脈

Phase A-2 で mock 層 (`src/entities/<x>/api/mock/`) で動かしていたドメインデータを、Phase C で実 DB に置換する。
Cloudflare Workers でホストする本プロジェクトでは D1 (SQLite) が第一候補。
ORM / migration ツールの選定を確定する必要がある。

## 決定

- **DB**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM (`drizzle-orm`、`drizzle-orm/d1` adapter)
- **Migration**: drizzle-kit `generate` → `wrangler d1 migrations apply` の二段運用
  - `drizzle-kit generate` で schema diff から SQL を `drizzle/migrations/NNNN_*.sql` に出力 (git track)
  - `wrangler d1 migrations apply pla-stock --local|--remote` で適用
  - `wrangler.jsonc` の `d1_databases[0].migrations_dir` を `drizzle/migrations` に設定

## 結果

- TypeScript-first な schema 定義 → `$inferSelect` で型を schema から派生可能 (ADR-0008 と整合)
- Workers の bundle size 制約 (1MB script) に優しい (drizzle-orm は軽量)
- Migration SQL は git track され code review 可能
- `drizzle-kit push` (直接同期) は dev/prod ドリフトリスクがあるため不採用
- D1 では SQLite の制約 (ENUM 型なし、CHECK 制約は drizzle-kit が emit せず) のため
  enum バリデーションは app 側 (Zod / drizzle の `enum:` ヒントによる TS narrowing) に依存

## 代替案

- **Prisma**: Workers 上で bundle が重く、D1 サポートは experimental。却下
- **Kysely**: type-safe query builder としては良いが migration ツールが弱く schema 同期コストが上がる。却下
- **drizzle-kit push**: dev/prod 間で schema drift リスク。CI レビュー対象にしにくい。不採用
