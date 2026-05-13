# pla-stock

プラモデル・塗料の在庫管理ツール。

## ステータス

**Phase A-2 完了、Phase C 着手中** — Drizzle + D1 schema 基盤導入済み。
FSD スケルトン + MUI v7 + Clerk + Kit/Paint/Project 各画面 (Dashboard / List / Detail / Add/Create) は mock データで動作。
Phase C で mock → 実 DB (D1) へ段階移行中 (server fn 化は domain ごとの後続 PR)。

## スコープ

- **MVP**: プラモデル（キット）管理 + 塗料管理
- **v2 以降**: 消耗品（ヤスリ・マスキングテープ・デカール軟化剤など）

## 技術スタック

- フレームワーク: [TanStack Start](https://tanstack.com/start)
- UI: [MUI v7](https://mui.com/material-ui/) + Emotion (ADR-0002)
- 認証: [Clerk](https://clerk.com/)
- ホスティング: [Cloudflare Workers](https://workers.cloudflare.com/)
- DB: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) — ADR-0006
- ORM: [Drizzle](https://orm.drizzle.team/) (`drizzle-orm` + `drizzle-kit`) — ADR-0006

## 開発環境セットアップ

[mise](https://mise.jdx.dev/) を使うと Node と pnpm のバージョンを自動で揃えられる:

```bash
# mise インストール (Mac の例)
curl https://mise.run | sh

# プロジェクトディレクトリに入ると mise.toml に従って Node + pnpm を auto install
cd pla-stock
mise install   # 初回のみ

# 以降は cd した瞬間に環境が揃う
pnpm install
pnpm dev
```

mise を使わない場合は `.nvmrc` (Node 24) + Corepack (pnpm@10.28.0) で同等の環境が組める。

## D1 (DB) セットアップ

初回のみ:

```bash
# 1. Cloudflare ログイン (ブラウザ OAuth)
pnpm wrangler login

# 2. D1 DB 作成 (出力された database_id を控える)
pnpm wrangler d1 create pla-stock

# 3. wrangler.jsonc の d1_databases[0].database_id を書き換え

# 4. 型生成 (Env.DB が D1Database 型になる)
pnpm cf-typegen

# 5. local D1 に schema を適用
pnpm db:migrate:local
```

schema 変更時:

```bash
pnpm db:generate          # SQL migration を drizzle/migrations/ に出力 (git commit する)
pnpm db:migrate:local     # local D1 (.wrangler/state/...) に適用
pnpm db:migrate:remote    # prod D1 に適用 (本番 DB 作成・運用開始後)
```

GUI 閲覧: `pnpm db:studio` (drizzle-kit studio が起動、`https://local.drizzle.studio` を開く)

## 参考（頓挫済み・参考程度）

- [hiromiogawa/plamodel](https://github.com/hiromiogawa/plamodel) — プラモデル在庫管理
- [hiromiogawa/white_base](https://github.com/hiromiogawa/white_base) — ガンプラ作成管理
