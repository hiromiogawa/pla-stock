# pla-stock

プラモデル・塗料の在庫管理ツール。

## ステータス

**Phase A-1 完了 — モックプロトタイプ基盤**。
FSD スケルトン + shadcn/ui + モック認証 + AppShell + Landing + Dashboard 動作確認済み。
Kit / Paint / Project / Settings 画面および Admin 画面は Phase A-2 以降で追加予定。

## スコープ

- **MVP**: プラモデル（キット）管理 + 塗料管理
- **v2 以降**: 消耗品（ヤスリ・マスキングテープ・デカール軟化剤など）

## 予定技術スタック

- フレームワーク: [TanStack Start](https://tanstack.com/start)
- ホスティング: [Cloudflare Workers](https://workers.cloudflare.com/)
- DB: [Neon](https://neon.tech/) (Postgres)
- ORM: [Drizzle](https://orm.drizzle.team/)（仮）

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

## 参考（頓挫済み・参考程度）

- [hiromiogawa/plamodel](https://github.com/hiromiogawa/plamodel) — プラモデル在庫管理
- [hiromiogawa/white_base](https://github.com/hiromiogawa/white_base) — ガンプラ作成管理
