# ADR-0013: Phase D 画像ストレージ — R2 + server fn proxy + クライアント圧縮

- ステータス: 承認
- 日付: 2026-05-21
- 関連: Epic #6 (Phase D)、ADR-0006 (Drizzle/D1)、ADR-0008 (entity SSoT)、ADR-0012 (server state は loader 単独)、ADR-0010 (master カタログ)

## コンテキスト

project の写真機能（製作工程・完成写真）は現状 mock 実装である。`entities/project/api/mock/projects.ts` の `addProjectPhoto` / `deleteProjectPhoto` が in-memory 配列を操作し、画像は URL 文字列の直入力で扱っている（実体のバイナリ保存はしていない）。`project_photos` テーブル（D1）には `r2Key` フィールドが既に定義済みで、R2 統合を見越した設計になっている。

Phase D（Epic #6）でこれを実ストレージに移行する。決めるべき設計判断:

1. 画像バイナリをどこに格納するか
2. アップロードの経路（クライアント → ストレージ）
3. 配信（表示）の経路
4. クライアント側の画像最適化
5. Phase D のスコープ（Epic #6 起票時は kit box art / paint swatch / kit own photo / project photos の 4 対象を想定していた）

## 決定

### ストレージ: Cloudflare R2

画像バイナリは **Cloudflare R2**（S3 互換オブジェクトストレージ）に格納する。D1 の `project_photos` テーブルにはメタデータ（`r2Key` / `url` / `caption` / `takenAt`）のみを保持する。D1 は構造化データ、R2 はバイナリ、と役割を分ける。ローカル開発は Miniflare の R2 エミュレーション（D1 と同様）で完結する。

### アップロード: server fn proxy 方式

クライアント → server fn → `env.BUCKET.put()` で R2 に格納する。server fn 内で `auth()` から userId を取得し、対象 project の所有を確認してから put + D1 insert する。

### 配信: server route 経由

`routes` に `/photos/$key` 相当の route を設け、`env.BUCKET.get()` の結果を Response として返す。`<img src="/photos/{r2Key}">` で表示する。配信 route でも `auth()` + project 所有チェックを行い、project 所有者のみ閲覧可とする。

### クライアント圧縮: browser-image-compression

アップロード前にブラウザで `browser-image-compression` を用いて WebP 変換 + リサイズ（長辺 1600px 程度、数百 KB ターゲット）を行う。新規ライブラリ採用。

### R2 オブジェクトキー命名

`{userId}/{yyyy}/{mm}/{uuid}.webp`。userId 前置でユーザー単位の分離、年月でディレクトリ分散、uuid で衝突回避。

### Phase D のスコープ

**Phase D（Epic #6）は project photos のみを対象とする。** kit box art / paint swatch は admin が master データに画像を付ける admin 機能のため Phase E（Admin 画面）のスコープへ分離。kit own photo は後続とする。

## 選択肢

### アップロード方式

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| **Y. server fn proxy（採用）** | R2 binding (`env.BUCKET.put()`) で完結、署名ライブラリ不要、実装シンプル | ファイルが Worker を経由する。ただしクライアント圧縮後は数百 KB で Worker のサイズ制限は問題にならない |
| X. presigned PUT URL | Worker 帯域を使わず R2 へ直送 | presigned URL 生成に S3 互換署名（aws4fetch 等）が必要で実装が複雑。圧縮後は小さいため帯域節約のメリットが小さい |

### 配信方式

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| **P. server route 経由（採用）** | ローカル R2（public URL なし）でも動く、アップロードと一貫、所有者認証を route で挟める | Worker 帯域を使う（圧縮済みのため軽微） |
| Q. R2 public bucket + 独自ドメイン CDN | 本番配信が速い | 独自ドメイン設定は Phase F（デプロイ）の領域、ローカル開発で確認しにくい、認証を挟みにくい |

### Phase D スコープ

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| **A. project photos のみ先行（採用）** | Phase C で mock 残しした部分の本実装で完結、user 機能に閉じる、admin UI と混線しない | kit/paint の画像対応が後回し |
| B. Epic #6 全対象（4 種）一括 | 一度に画像機能が揃う | admin 系（box art/swatch）が Admin 画面（Phase E）と混線、スコープ過大 |

## 結果

### 良い面

- 画像バイナリの実ストレージ（R2）が入り、URL 直入力 mock を脱却できる
- D1（メタデータ）と R2（バイナリ）の役割が明快
- アップロード・配信とも Worker 内で完結し、ローカル（Miniflare）で全フローを確認できる
- 配信 route で所有者認証を挟めるため、他人の project 写真を URL 推測で見られない
- project entity の mock photo 関数を全廃でき、project ドメインの mock 脱却が完了する

### 悪い面・受容するコスト

- 画像が Worker を経由する（アップロード・配信とも）。クライアント圧縮で数百 KB に抑えるため実害は小さいが、大量配信時は Worker のリクエスト数・帯域を消費する
- 独自ドメイン CDN による高速配信は Phase F まで持ち越し
- 新規ライブラリ `browser-image-compression` への依存追加
- 本番配信のパフォーマンスが問題化したら、配信方式を案 Q（public bucket + CDN）へ移行する新 ADR が必要になりうる

### 実装ステップ

Epic #6 配下の Task で実施する:

1. #134 本 ADR の起票
2. #137 R2 基盤導入（バケット作成 + binding + browser-image-compression）
3. #135 project photo の server fn 化 + 配信 route（mock 脱却）
4. #136 AddPhotoDialog を ファイル選択 + クライアント圧縮 UI に改修
