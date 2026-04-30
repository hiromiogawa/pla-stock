# ADR-0004: 一覧 view の virtualization に @tanstack/react-virtual を採用

- ステータス: 承認
- 日付: 2026-04-30
- 関連: ADR-0002 (MUI 採用)、Issue #59、`docs/superpowers/specs/2026-04-30-list-views-uiux-design.md`

## 文脈

PaintListView は塗料 stock を 1000 行近く保持する想定 (個人モデラーで Mr.Color / Tamiya / Gaia 系統合計)。
TanStack Table v8 で全行 render すると DOM が重くなる、特に SP。
`react-window` / `react-virtuoso` も検討候補だが、TanStack Table と同 organization の `@tanstack/react-virtual` が最も整合する。

## 決定

- `@tanstack/react-virtual` を 3 list view (Kit / Paint / Project) すべてに採用
- `useReactTable` + `useVirtualizer` の integration は tanstack-table 公式 docs (Virtualized Rows example) に準拠
- estimateSize: table row 56px、card 84px
- `measureElement` で実 height を計測補正
- SP の card list も同 hook で virtualize

## 採用しなかった選択肢

- **react-window**: API が古い、TanStack エコシステム外
- **react-virtuoso**: 高機能だが overkill、bundle 増 (~30KB vs @tanstack/react-virtual ~5KB)
- **virtualization なし + 行 render 最適化**: 1000 行で SP は明確に重い、将来の感度低下が懸念

## 結果

- 1000 行 paint stock でも SP / PC とも滑らかに scroll
- kit / project (~10-100 行) は overkill だが pattern 統一の利を取る
- bundle 影響 ~5KB gz
