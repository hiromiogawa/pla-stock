# domain-modeling

pla-stock の domain 表現規約。Drizzle schema を SSoT、UI label のみ別ファイル。

## schema.ts が SSoT (ADR-0008、ADR-0005 を Supersede)

ドメインのテーブル定義・列・enum values・派生型は **`entities/{domain}/schema.ts`** に Drizzle table として集約する。

```ts
// entities/kit/schema.ts (SSoT)
export const KIT_EVENT_REASONS = ['purchase', 'project', 'gift', 'sell', 'discard', 'other'] as const
export const kitEvents = sqliteTable('kit_events', {
  // ...
  reason: text('reason', { enum: KIT_EVENT_REASONS }).notNull(),
})
export type KitEvent = typeof kitEvents.$inferSelect
export type KitEventReason = (typeof KIT_EVENT_REASONS)[number]

// entities/kit/model.ts (UI labels のみ)
export type { KitEvent, KitEventReason } from './schema'
export const KIT_EVENT_REASON_LABELS = {
  purchase: '購入', project: 'プロジェクト', /* ... */
} as const satisfies Record<KitEventReason, string>
```

## 中間テーブル (M:N)

**専用 entity ディレクトリ** を切る (例: `entities/projectPaintUse/schema.ts`)。この entity だけが両端 entity (`entities/project` / `entities/paint`) の schema を import してよい。

## 利用側の規約

- entity barrel (`~/entities/{domain}`) 経由で値・型・labels を取り出す
- UI 専用 subset (例: release だけで使う reasons) は dialog 内に `as const satisfies readonly KitEventReason[]` で型整合だけ守って宣言
- 同 subset を 2 箇所以上で使うなら entity 側に昇格させる

## timestamp の 2 種類区別

| 種類 | Drizzle 型 | boundary 型 | 例 |
|---|---|---|---|
| 時点 (instant) | `integer({ mode: 'timestamp_ms' })` | `Date` | `createdAt` / `updatedAt` |
| カレンダー日付 | `text('purchased_at')` | `string` ('YYYY-MM-DD') | `purchasedAt` / `startedAt` |

ミス防止: schema 定義時にどちらか必ず判断。混在しない。

## seed と test fixture の役割境界

- **`src/entities/<x>/api/seed/`**: dev seed 専用データ (`src/shared/lib/db/seed.ts` から D1 投入)。**production からの import は depcruise `no-seed-from-production` で機械強制禁止**
- **test 用の data**: `src/test-utils/factories/<entity>.ts` の `createTest<Entity>(overrides)` を使う (ADR-0016)

## 強制方法 / convention

- 機械強制はせず convention 運用 (ADR-0008)
- AI エージェントが本規約に違反した場合は `claude-handbooks:failure-record` skill で ADR-0007 に FAIL エントリ追記 → user に `/rule-cycle` 依頼

## 関連

- 設計経緯: ADR-0008 (entity schema SSoT、ADR-0005 を Supersede)、ADR-0006 (Drizzle + D1 採用)、ADR-0007 (failure log)
- 関連 entity: `src/entities/kit/`、`src/entities/paint/`、`src/entities/project/`、`src/entities/projectPaintUse/`
- 機械強制: `.dependency-cruiser.cjs` (no-seed-from-production)
