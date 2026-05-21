# ADR-0012: server state 管理を loader prefetch + TanStack Query 併用に移行

- ステータス: 承認
- 日付: 2026-05-21
- 関連: Epic #125、ADR-0006 (Drizzle/D1)、ADR-0008 (entity SSoT)、ADR-0010 (master カタログシード)、CLAUDE.md コード規約 #43 (Container/Hook/Presenter)

## コンテキスト

現状、server state（サーバーから取得したデータ）の管理は **TanStack Router の loader** に一本化されている。

- route file の `loader` が server fn を呼び、結果を route match に紐づく cache として Router が保持
- component は `Route.useLoaderData()` で取得 → Container が `useXxx()` hook に渡す → `<XxxView {...data} {...hookProps} />` で Presenter / 子コンポーネントへ props で渡す
- `@tanstack/react-query` は未導入

この構成には 2 つの不満があった:

1. **prop drilling**: Container → Presenter → 子コンポーネントへ props で server data を中継（2 階層程度）
2. **route 結合の回避が難しい**: prop drilling を消すには `getRouteApi().useLoaderData()` 直アクセスが要るが、これは component が route path 文字列を知る必要があり別種の結合を生む

さらに、データ規模の正しい認識が重要である:

- **`kits` / `paints` は admin curated の共通カタログ**（ADR-0010）。プラモ・塗料の実カタログは数百〜数千件規模で、**一覧のページネーションが必須**。かつ master は **全ユーザー非依存**（seed.ts でも「master は userId 非依存」）のため、複数ユーザーが同じ master を参照する＝ **cache 共有の実利が大きい**
- per-user データ（`*_stocks` / `*_events` / `projects`）は個人規模

TanStack 公式は、loader cache を「軽量な stale-while-revalidate cache」と位置づけ、本格的な server state 管理（ページネーション・cache 共有・background refetch・optimistic update 等）は **TanStack Query との統合**を中〜大規模アプリ向けに推奨している。

## 決定

server state 管理を **case A: TanStack Router loader (prefetch) + TanStack Query (cache 本体) の併用**に移行する。

### 役割分担

- **loader = 「prefetch のタイミング」担当**: route loader 内で `queryClient.ensureQueryData(...)` を呼び、SSR のサーバー側という早いタイミングで Query の cache を温める。loader 自身は値を返さない／使わない
- **TanStack Query = 「cache の本体」**: cache の保持・共有・無効化・再取得を担う。loader 自身の cache は使わず **Query に一本化**（二重 SSoT 回避）
- component は `useSuspenseQuery` で Query cache から読む

### 配置とルール

- `queryOptions`（`queryKey` + `queryFn`）は **`entities/<x>/api/` に定義**（cache 定義の SSoT、ADR-0008 の entity 集約方針と整合）。`queryFn` は既存 server fn を再利用
- **route loader はその route 配下で使う全 query を `Promise.all` で prefetch する責任を持つ**（component が読む query と loader の prefetch リストがズレると waterfall が発生し SSR の旨味を失うため）
- `kits` / `paints` の master 一覧は Query の `placeholderData`（旧 keepPreviousData）でページネーション
- mutation 後の cache 無効化は `router.invalidate()` から `queryClient.invalidateQueries()`（ピンポイント無効化）へ移行

### コード規約 #43 の改訂（案 iii）

case A は現行の Container/Hook/Presenter 規約（#43）と衝突するため、#43 を以下に改訂する:

- **データ取得 (`useSuspenseQuery`) は View / 主要 widget に限定**。末端の表示専用 component は原則 props で受け取る（末端が「親と無関係な独立データ源」を要する場合のみ例外的に query 可）
- **Hook (`useXxx.ts`) は「振る舞い専任」に純化**: mutation handler + local UI state のみを持ち、データ取得は持たない
- Presenter の「pure」は末端の表示専用 component には残るが、View / widget は「データ取得可能な層」になる
- `*View.tsx` での hook import を制限する oxlint ルールは、`useSuspenseQuery` を許可する形に調整

## 選択肢

### server state アーキテクチャ

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| **A. loader prefetch + Query 併用（採用）** | SSR の速さ（loader）と route 非依存・cache 共有・ページネーション（Query）を両取り。公式推奨の統合構成 | 新規ライブラリ、waterfall 防止規律が必要、移行工数 |
| B. 現状維持（loader + props） | 追加ライブラリ不要、最小構成 | prop drilling が残る、master カタログのページネーション・cache 共有を loader だけで実現するのは苦しい |
| C. Query 単独（loader 廃止） | route 結合なし、構成シンプル | loader を捨てるため SSR prefetch の旨味を失い初回表示が遅くなる |

### コード規約 #43 の扱い

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| i. #43 維持（Hook のみ query） | pure Presenter を完全維持 | prop drilling が解消されず、case A の主目的の一つを達成できない（中途半端） |
| ii. 全面直呼び（末端 component も query 可） | prop drilling 完全ゼロ | データ取得箇所が末端まで散り、画面が何を fetch するか追いにくい。waterfall 規律も緩む |
| **iii. 折衷（View/widget は query 可、末端は props、採用）** | drilling をほぼ解消しつつデータ取得を追える範囲に保つ。waterfall 規律を `loader = route の全 query を prefetch` で機械的に守れる | #43 の改訂と oxlint ルール調整が必要 |

## 結果

### 良い面

- prop drilling が「View → 末端」の 1 段程度に縮小
- component が route path を知らずに済む（`queryKey` でアクセス、route 非依存）
- `kits` / `paints` master 一覧のページネーションが Query の標準機能で実現
- master が全ユーザー共通 → 同一 `queryKey` の cache をアプリ全体で共有・dedupe
- mutation 後の cache 無効化がピンポイント（`invalidateQueries`）になり過剰な再取得が減る
- Hook の責務が「振る舞い専任」に明快化

### 悪い面・受容すべきコスト

- 新規ライブラリ（`@tanstack/react-query`）への依存追加
- loader の prefetch リストと component の query をズレさせない規律が必要（ズレると waterfall）
- コード規約 #43 の改訂、oxlint ルール調整が必要
- 既存の kit/paint/project read query を一斉移行する工数（Epic #125）
- loader と Query の二重 cache にしないルール（loader は値を返さず prefetch に徹する）の徹底

### 規模評価の経緯（却下された議論の記録）

brainstorming の途中で「pla-stock は個人の在庫管理ツールであり、TanStack Query の高機能（background refetch・optimistic update・無限スクロール・polling）はほぼ使わない。現規模では時期尚早ではないか」という評価が出た。

しかしこれは **`kits` / `paints` を個人規模のデータと誤認したもの**だった。実際には master は **admin curated の共通カタログ**でカタログ規模（数百〜数千件）、かつ全ユーザー共通である。この正しい規模認識のもとでは:

- 一覧のページネーションは現時点で必須
- master cache の全ユーザー共有は実利が大きい

したがって「時期尚早」論は誤った規模認識に基づくものとして退けられ、case A 採用は「将来の布石」ではなく **現時点で実利のある判断**と結論づけた。

## 実装ステップ

Epic #125 配下の Task で段階実施する:

1. #126 本 ADR の起票
2. #127 TanStack Query 基盤導入（QueryClient + SSR dehydrate/hydrate）
3. #128 kit read query を case A 化 + 一覧ページネーション
4. #129 paint read query を case A 化 + 一覧ページネーション
5. #130 project read query を case A 化
6. #131 コード規約 #43 改訂 + oxlint ルール調整
