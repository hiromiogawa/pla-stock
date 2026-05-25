# pla-stock

プラモデル・塗料の在庫管理ツール。

## ステータス

**Phase A-2 / C / D 完了、Phase F (本番 deploy) 準備中** — kit / paint / project mutation は Drizzle + D1 server fn に完全移行済、R2 写真 upload (Phase D) も稼働中。
FSD スケルトン + MUI v7 + Clerk + Kit/Paint/Project 各画面 (Dashboard / List / Detail / Add/Create) は実 D1 で動作。
test 戦略 (Trophy + co-location + C1 70% gate) は ADR-0016 / ADR-0017 に確定。
本番 deploy の手順は下記「本番 deploy」セクション参照。

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

### dev データ seed

D1 は初期状態が空のため、mock 相当データを投入する seed を用意している:

```bash
# Clerk dashboard で自分の userId (user_xxx) を確認し、それを指定して seed
SEED_USER_ID=user_xxx pnpm db:seed:local
```

- `kits` / `paints` などの master は userId 非依存で常に入る
- `kit_stocks` / `kit_events` などの per-user データは `SEED_USER_ID` に紐付く
- `SEED_USER_ID` 未指定時は fallback 値で投入されるが、実 Clerk userId でないと
  在庫数・購入履歴の画面は空に見える (master 一覧・project 選択は動く)
- seed は truncate-then-insert (再実行で全 dev データ入れ替え)。dev 専用
- `better-sqlite3` の native binding を使う。`pnpm install` 時に自動 build される
  (`pnpm.onlyBuiltDependencies` で許可済)。build に失敗する環境では Xcode CLT /
  ビルドツールチェーンを確認

## 本番 deploy (Cloudflare Workers)

Phase F の本番デプロイ手順。**初回セットアップ** (user 一回作業) と **以降の deploy** (main マージで CI 自動) を分けて記載。

> **前提**: Cloudflare account / Clerk アカウントは既に持っていること。無料プランで開始可能。
> **以降の deploy**: 初回セットアップ完了後は **main にマージするだけ** で GitHub Actions の `deploy` workflow が自動実行 → 本番 D1 migration → build → wrangler deploy の順で走る。

### 初回セットアップ (user 一回作業)

#### 1. Cloudflare 側の払い出し

```bash
# Cloudflare ログイン (ブラウザ OAuth 開く)
pnpm wrangler login

# 本番 D1 DB を作成 (出力された database_id を控える)
pnpm wrangler d1 create pla-stock

# R2 bucket を作成 (画像保存用、Phase D)
pnpm wrangler r2 bucket create pla-stock-images
```

`wrangler.jsonc` の `d1_databases[0].database_id` と `r2_buckets[0].bucket_name` を上記で取得した値に書き換えてコミット (機微情報ではないので公開リポジトリに含めて OK)。

> **既存リソースがある場合**: `wrangler d1 create` / `r2 bucket create` は同名で再実行するとエラーになる。`pnpm wrangler d1 list` / `r2 bucket list` で既存確認後、`wrangler.jsonc` の binding 値が一致していればこのステップは skip。

#### 2. Clerk production instance を作成

[Clerk dashboard](https://dashboard.clerk.com/) で:

1. 新規 application を "Production" mode で作成 (既存 dev instance とは分離)
2. **Allowed origins** に本番 URL (`https://pla-stock.<your-subdomain>.workers.dev` or custom domain) を追加
3. **Sign-in URL** / **Sign-up URL** / **After sign-in URL** / **After sign-up URL** を本番 URL に揃える
4. API keys タブから `Publishable key` と `Secret key` をコピー (次節で配置)

#### 3. Workers Secret を配置 (run-time 用)

Cloudflare Workers の production runtime が読む secret。CI 経由ではなく `wrangler secret put` で配置 (Cloudflare 側で暗号化保存):

| Secret 名 | 用途 | 取得元 |
|---|---|---|
| `CLERK_PUBLISHABLE_KEY` | Clerk client SDK (`pk_live_...`) | Clerk dashboard > API keys |
| `CLERK_SECRET_KEY` | Clerk server SDK (`sk_live_...`、auth wrapper 用) | 同上 |

```bash
# 各 Secret を本番 Workers に配置 (prompt で値を入力)
pnpm wrangler secret put CLERK_PUBLISHABLE_KEY
pnpm wrangler secret put CLERK_SECRET_KEY
```

配置済 Secret の一覧は `pnpm wrangler secret list` で確認できる (値そのものは表示されない)。

> **将来追加候補**: Sentry (#44 で導入予定の `SENTRY_DSN`)、外部 API 連携時の API key 等。新規 Secret 追加時は本表に追記する。

#### 4. CI 自動 deploy 用 API Token を発行 + GitHub Secret に配置

`.github/workflows/deploy.yml` が `wrangler deploy` を実行するために必要。

**4-1. Cloudflare で API Token を発行**:

1. [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) にアクセス
2. **"Create Token"** をクリック
3. **"Edit Cloudflare Workers"** テンプレートを **"Use template"** で選択 (built-in、必要 permission が prefilled)
   - Workers Scripts: Edit / D1: Edit / Workers R2 Storage: Edit / その他 read 系
   - 不要なら Zone permissions (Workers Routes 等) は削除可
4. **Account Resources**: 自分の account を選択
5. **TTL**: 無期限でも可 (心配なら 1 年)
6. **"Continue to summary"** → **"Create Token"**
7. **トークン文字列を必ずコピー** (画面遷移すると再表示不可)

**4-2. GitHub repo に Secret 配置**:

1. GitHub repo > **Settings** > **Secrets and variables** > **Actions**
2. **"New repository secret"** クリック
3. Name: `CLOUDFLARE_API_TOKEN` / Value: 上記コピーしたトークン
4. **"Add secret"** で保存

#### 5. 初回 deploy を手動実行 + 動作確認

CI workflow の動作確認前に **手動で 1 回 deploy** して切り分けやすくする:

```bash
# 本番 D1 に schema を反映
pnpm db:migrate:remote

# build + wrangler deploy
pnpm deploy
```

完了後、出力される URL (`https://pla-stock.<your-subdomain>.workers.dev`) で動作確認 (下記 checklist)。

#### 6. 動作確認動線 (本番化 checklist)

初回 deploy 後、以下を順に確認:

- [ ] `https://<本番 URL>/` で Landing が表示される
- [ ] "Sign In" から Clerk SignIn flow が走り、production Clerk のユーザーで login できる
- [ ] login 後 `/dashboard` で 5 cards が表示される (在庫 0 でも空 cards で OK)
- [ ] `/kits` でキット一覧が表示 (空でも OK)、`+ 追加` から新規キット登録 → 在庫 +1 が反映される
- [ ] `/paints` で塗料一覧が表示、`+ 追加` から新規塗料登録 → 在庫 +1
- [ ] `/projects` でプロジェクト一覧、作成すると kit 在庫が -1 される (D1 batch 動作確認)
- [ ] 写真添付 (Phase D) — project detail で画像 upload → R2 に格納 → 表示確認
- [ ] log out → 再 SignIn できる
- [ ] (任意) Cloudflare dashboard で Workers の Requests / Errors を確認

### 以降の deploy (CI 自動)

初回セットアップ完了後、main ブランチへの push (PR merge 含む) で **`.github/workflows/deploy.yml`** が自動起動し、以下を順に実行:

1. `pnpm install --frozen-lockfile`
2. `wrangler d1 migrations apply pla-stock --remote` (schema 同期)
3. `pnpm build`
4. `wrangler deploy`

進捗は GitHub Actions の **"Actions"** タブで確認。失敗時は **"Re-run failed jobs"** で再試行。

手動で再 deploy したいときは GH Actions UI で **`deploy` workflow > "Run workflow"** を選択 (`workflow_dispatch` trigger 配線済)。

### 緊急時の手動 deploy (CI が動かない / hotfix)

CI workflow が壊れている / 緊急で手元から push したいとき:

```bash
pnpm db:migrate:remote
pnpm deploy
```

### rollback

deploy が壊れた / バグ deploy をすぐ戻したい場合:

```bash
# 一つ前の deployment に rollback (interactive で確認 prompt)
pnpm wrangler rollback

# 過去 deployment 一覧 (deployment ID を選んで rollback の引数に渡せる)
pnpm wrangler deployments list

# 特定 deployment に rollback
pnpm wrangler rollback <DEPLOYMENT_ID>
```

migration を巻き戻したい場合は **drizzle が down migration を出力しない** ため、手動で revert SQL を書いて `pnpm wrangler d1 execute pla-stock --remote --file=revert.sql` で適用する。

### wrangler.jsonc の env 戦略

現状 `wrangler.jsonc` は **single env** で構成 (`[env.production]` block なし)。dev は `--local` フラグで local SQLite、prod は `--remote` で実 D1 を使う運用。

dev / prod で **異なる D1 instance を使う必要が出たら** `[env.production]` block を追加して binding を分離する判断 (現状は MVP のため single instance で運用、dev データは seed で投入)。

## 関連 docs

- `docs/adr/` — 設計判断記録 (ADR-0001 〜 ADR-0017)
- `docs/specs/` — 仕様書
- `CLAUDE.md` — 開発規約 + skill 起動トリガー表
- Issue #8 (Phase F Epic)、Issue #170 (品質改善 Epic)、Issue #44 (Sentry)

## 参考（頓挫済み・参考程度）

- [hiromiogawa/plamodel](https://github.com/hiromiogawa/plamodel) — プラモデル在庫管理
- [hiromiogawa/white_base](https://github.com/hiromiogawa/white_base) — ガンプラ作成管理
