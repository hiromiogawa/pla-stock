# ADR-0012: server state は TanStack Router loader を維持する (TanStack Query 併用は見送り)

- ステータス: 承認
- 日付: 2026-05-21
- 関連: ADR-0006 (Drizzle/D1)、ADR-0008 (entity SSoT)、ADR-0010 (master カタログシード)、CLAUDE.md コード規約 #43 (Container/Hook/Presenter)

## コンテキスト

server state（サーバーから取得したデータ）の管理は現状 **TanStack Router の loader** に一本化されている。

- route file の `loader` が server fn を呼び、結果を route match に紐づく cache として Router が保持
- component は `Route.useLoaderData()` で取得 → Container が `useXxx()` hook に渡す → `<XxxView {...data} {...hookProps} />` で Presenter / 子コンポーネントへ props で渡す
- mutation 後は `router.invalidate()` で loader を再実行
- `@tanstack/react-query` は未導入

この構成には 2 つの不満が指摘された:

1. **prop drilling**: Container → Presenter → 子コンポーネントへ props で server data を中継（2 階層程度）
2. **route 結合の回避が難しい**: prop drilling を消す `getRouteApi().useLoaderData()` 直アクセスは、component が route path を知る別種の結合を生む

加えて `kits` / `paints` は admin curated の共通カタログ（ADR-0010）でカタログ規模（数百〜数千件）になり、一覧のページネーションが必要である。

これらを背景に、TanStack Query を併用する案（loader prefetch + Query、case A）を brainstorming で検討した。

## 決定

**server state 管理は現状の TanStack Router loader 単独構成を維持する。TanStack Query の併用は見送る。**

- server state は loader が取得し、Router の route cache に保持する。component は `Route.useLoaderData()` 経由で受け取る
- master 一覧のページネーションは **search param（`?page=N` 等）+ loader** で実装する（TanStack Router の型付き search param 機能を使う）
- prop drilling は 2 階層程度を許容する（CLAUDE.md コード規約 #43 の pure Presenter とのトレードオフとして受容）
- コード規約 #43（Container/Hook/Presenter）は**変更しない**
- TanStack Query は下記「再検討条件」に該当したら改めて検討する

## 選択肢

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| A. loader prefetch + Query 併用（case A） | route 非依存、画面跨ぎ cache 共有、ページ送り UX が滑らか、公式の統合構成 | 新規ライブラリ、waterfall 防止規律が必要、コード規約 #43 の改訂と oxlint 調整、移行工数。**現規模では高機能の多くが当面未使用** |
| **B. loader 単独を維持（採用）** | 追加ライブラリなし、最小構成、server state の SSoT が loader cache 一本で単純、#43 を変えずに済む | prop drilling 2 階層が残る、画面跨ぎの master cache 共有がない、ページ送りは遷移ベース |
| C. Query 単独（loader 廃止） | route 結合なし | loader を捨てるため SSR prefetch の旨味を失い初回表示が遅い |

## 結果

### 良い面

- 追加ライブラリ・追加学習コストなし。MVP 完成に集中できる
- server state の SSoT が「loader の route cache」一本で、二重キャッシュの整合問題が発生しない
- コード規約 #43 をそのまま維持できる（oxlint ルール改訂も不要）
- master 一覧のページネーションは loader + search param で実装可能（標準的な TanStack Router の使い方）

### 悪い面・受容するコスト

- prop drilling が Container → Presenter → 子の 2 階層程度残る（#43 の pure Presenter を守る代償）
- 画面跨ぎで同じ master（例: `kit-2`）が別 route で再 fetch される。ただし master は admin curated でほぼ不変のデータのため、重複 fetch の実害は小さい
- ページ送りは route 遷移ベース（遷移中は pendingComponent）。Query の `placeholderData` のような「前ページを表示したまま次を読み込む」滑らかさはない

### case A を見送った理由（却下記録）

brainstorming の過程で case A（loader prefetch + Query 併用）を一度は採用しかけた（本 ADR のドラフトは当初 case A 採用で書かれていた）。最終的に見送ったのは以下の整理による:

1. **「公式が Query を推奨」の解釈の補正**: TanStack 公式の立場は「Query を *入れるなら* cache を二重化しないよう Query 側に寄せろ」であって、「全アプリで Query を入れろ」ではない。公式は「シンプルなアプリは built-in loader で十分」とも明記している。「loader cache を捨てて Query へ」は *Query 導入を決めた後の帰結* であり、出発点の推奨ではない
2. **master カタログも loader 単独で扱える**: 「カタログ規模だから Query が要る」と評価したが、ページネーションは search param + loader で標準的に書ける。Query は「あると楽」だが「無いと詰む」ものではない。master はほぼ不変データのため cache 共有の不在も実害が小さい
3. **現規模では Query の高機能が当面未使用**: background refetch / optimistic update / 無限スクロール / polling は pla-stock の現状要件にない。2 階層の prop drilling 解消のためだけに大規模向けライブラリを導入するのは YAGNI に反する

### 再検討条件

以下に該当したら本 ADR を Supersede する新 ADR で case A（または別案）を再検討する:

- prop drilling が 4 階層以上に深くなった
- 複数ユーザーの同時編集や、頻繁な background 更新が要件化した
- master 一覧で「前ページ表示したまま次ページ読み込み」等の滑らかな UX が体感品質の問題として顕在化した
- Phase D-F で画面数が大幅に増え、画面跨ぎの cache 共有が実利を生むようになった

## 備考

本 ADR の決定に伴い、case A 移行のために起票した Epic #125 および Task #127-131（Query 基盤導入 / 各 entity の case A 化 / #43 改訂）はクローズした。master 一覧のページネーション（loader + search param での実装）は方針に依存せず必要なため、Task #133 として切り直した。
