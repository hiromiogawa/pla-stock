# ADR-0003: TanStack Form + MUI integration パターン

- ステータス: 承認
- 日付: 2026-04-27 (初版) / 2026-05-01 (Issue #73 で改訂)
- 関連: ADR-0002 (MUI 採用)、Issue #42、Issue #73、Phase β-2

## 文脈

ADR-0002 で MUI を採用、既存 form は @tanstack/react-form を使用中。
MUI 公式 docs は react-hook-form の Controller pattern を例示するが、
TanStack Form 例は限定的。プロジェクト内で統一 pattern が必要。

初版 (2026-04-27) は MUI `TextField outlined` + floated label の前提で
策定したが、Issue #73 で Dialog (`Input` + `Label` 組合せの label-above
style) との craft 不整合が顕在化したため、本 ADR を改訂。

## 決定

- form 値の binding は **render prop pattern** (`<form.Field>{(field) => ...}`) を継続
- field と MUI コンポーネントの橋渡しは **`<FormTextField field={...} />` / `<FormSelect field={...} options={...} />`** 共通 wrapper を経由
- 内部実装は **MUI コンポーネントのみ** (`OutlinedInput` / `Select` / `FormLabel` / `FormHelperText` / `Stack` / `MenuItem`) で構築。`styled('html-element')` (Emotion 経由) は **Form 層では使わない**
- レイアウトは **label-above** (外部 `FormLabel` を field 上に配置)、floated label / `FormControl` + `InputLabel` 構成は採用しない
- error / helperText は wrapper が `field.state.meta.errors` から自動配線、`<FormHelperText error>` で field 下に表示
- raw `<Input>` + `<Label>` + 手書き error の組合せは form では使わない (Phase β-2 以降)

## 採用しなかった選択肢

- **react-hook-form**: TanStack エコシステム整合性で TanStack Form を継続
- **MUI Controller-style adapter**: TanStack Form は render prop が公式、Controller は r-h-f 由来の概念
- **raw `<TextField>` 直叩き**: error/helperText 配線が散らかる
- **floated label (旧 ADR の方針)**: Dialog の label-above と craft 不一致、外部 label に統一
- **shadcn-derived `Input` / `Textarea` primitives 採用 (Form 内部)**: `styled('html-element')` 経由で Emotion 依存、engine 移行 (Pigment CSS 等) でコスト発生。MUI コンポーネント直叩きを優先

## 結果

- 4 form view (KitStockForm / PaintStockForm / ProjectCreateForm / ProjectEditForm) が同じ pattern で書ける
- error UI / helperText の見た目が統一
- Dialog (Input/Textarea/Label primitives) と craft 一致 (label-above + simple bordered)
- field 間 spacing は `Stack spacing 3` で統一
- engine 移行 (Pigment CSS 等) で MUI 自体が追従、Form 内部 user code は無修正
- 将来 react-hook-form に戻すなら wrapper 内部の field reference を Controller の register に置き換え

## 残課題 (本 ADR スコープ外、別 issue)

- Dialog の primitives (`~/shared/ui/{input,textarea,label}.tsx` = `styled('html-element')` 経由) を MUI `OutlinedInput` / `FormLabel` に置き換え、shared/ui の styled-native 廃止。Engine 隔離方針 (CLAUDE.md ルール 5) を完徹する形。
- TanStack Form 化されていない Dialog の form 化 (現状 useState 直叩き)
