# pla-stock

プラモデル・塗料の在庫管理ツール。

## ステータス

**Phase 1 — AI ハーネスのみ**。フレームワーク / ツール類は未スキャフォールド。

## スコープ

- **MVP**: プラモデル（キット）管理 + 塗料管理
- **v2 以降**: 消耗品（ヤスリ・マスキングテープ・デカール軟化剤など）

## 予定技術スタック

- フレームワーク: [TanStack Start](https://tanstack.com/start)
- ホスティング: [Cloudflare Workers](https://workers.cloudflare.com/)
- DB: [Neon](https://neon.tech/) (Postgres)
- ORM: [Drizzle](https://orm.drizzle.team/)（仮）

## 参考（頓挫済み・参考程度）

- [hiromiogawa/plamodel](https://github.com/hiromiogawa/plamodel) — プラモデル在庫管理
- [hiromiogawa/white_base](https://github.com/hiromiogawa/white_base) — ガンプラ作成管理
