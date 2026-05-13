# ADR-0008: Drizzle schema を entity の SSoT とする (Supersedes ADR-0005)

- ステータス: 承認
- 日付: 2026-05-13
- 関連: Epic #5、ADR-0006 (Drizzle + D1 採用)
- Supersedes: ADR-0005 (Domain enum 集約規約)

## 文脈

ADR-0005 では「`entities/{domain}/model.ts` に values 配列 + 型派生 + labels の 3 点セット」を SSoT としていた。
これは mock のみだった Phase A-2 段階での簡潔な規約。

ADR-0006 で Drizzle ORM を採用したことで、テーブル定義 (`sqliteTable`) が
列・型・enum を統合的に表現できるようになり、`model.ts` の手書き interface と
schema の二重管理は drift の温床となる。

## 決定

**Drizzle schema (`entities/{domain}/schema.ts`) を entity の SSoT とする。**

- テーブル定義: `entities/{domain}/schema.ts` の `sqliteTable(...)` 呼び出し
- enum values: 同 schema 内に `as const` 配列宣言 (`KIT_EVENT_REASONS = [...] as const`)
- 派生型: `typeof kits.$inferSelect` / `$inferInsert` で type を export
- UI labels (日本語表示文字列): `entities/{domain}/model.ts` に分離して所有

**中間テーブル (M:N) は専用 entity ディレクトリを切る。**

例: `project_paint_use` → `src/entities/projectPaintUse/schema.ts`。
この entity だけが他の entity (project / paint) の schema を import してよい。
現状の `.dependency-cruiser.cjs` には entity 同層 import 禁止ルールがないため
追加設定なしで通る (将来 sibling 禁止ルールを入れるなら本 entity を例外指定)。

**`model.ts` の役割:**

- schema からの type / enum re-export (consumer 向けの ergonomics)
- UI labels の保持 (例: `KIT_EVENT_REASON_LABELS`)
- それ以外のドメイン情報は所有しない

**timestamp の 2 種類区別:**

- **時点 (instant)** `createdAt` 等 → `integer({ mode: 'timestamp_ms' })`、boundary は `Date`
- **カレンダー日付** `purchasedAt` / `startedAt` 等 → `text('purchased_at')`、boundary は `string` ('YYYY-MM-DD')

`<input type="date">` の native value が 'YYYY-MM-DD' であることに合わせ、
カレンダー日付は Date でなく string で扱う (instant のみ Date)。

## 結果

- 型・列・enum の二重管理が排除される (schema が唯一の source)
- migration 出力と TS 型が常に整合
- `pnpm db:generate` を回す習慣で schema → migration → 型の 3 点を一括更新
- `entities/projectPaintUse/` のような junction entity が新概念として明示化
- AI エージェントが domain 値を扱う際は `entities/{domain}/schema.ts` を参照すれば
  値配列・型派生・labels (model.ts) の所在が一意に決まる

## 代替案

- **model.ts SSoT 維持** (ADR-0005 のまま): 手書き interface と Drizzle 列が drift する
- **shared/lib/db/schema/ に集中配置**: entity の凝集度が下がり、ドメインロジックと
  schema が離れる。FSD の slice 概念とも整合しにくい。却下
- **`shared/lib/db/schema.ts` を barrel として置く**: shared → entities への FSD レイヤー
  逆流になる。drizzle-kit の schema glob (`./src/entities/*/schema.ts`) で代替可能なため
  barrel は不要と判断 (本 PR で barrel を作成→削除した経緯あり)
