# ADR-0003: TanStack Form + MUI TextField integration パターン

- ステータス: 承認
- 日付: 2026-04-27
- 関連: ADR-0002 (MUI 採用)、Issue #42、Phase β-2

## 文脈

ADR-0002 で MUI を採用、既存 form は @tanstack/react-form を使用中。
MUI 公式 docs は react-hook-form の Controller pattern を例示するが、
TanStack Form 例は限定的。プロジェクト内で統一 pattern が必要。

## 決定

- form 値の binding は **render prop pattern** (`<form.Field>{(field) => ...}`) を継続
- field と MUI コンポーネントの橋渡しは **`<FormTextField field={...} />` / `<FormSelect field={...} options={...} />`** 共通 wrapper を経由
- error / helperText は wrapper が field.state.meta.errors から自動配線
- raw `<Input>` + `<Label>` + 手書き error の組合せは form では使わない (Phase β-2 以降)

## 採用しなかった選択肢

- react-hook-form: TanStack エコシステム整合性で TanStack Form を継続
- MUI Controller-style adapter: TanStack Form は render prop が公式、Controller は r-h-f 由来の概念
- raw `<TextField>` 直叩き: error/helperText 配線が散らかる

## 結果

- 3 form view + ProjectEditForm が同じ pattern で書ける
- error UI / helperText の見た目が統一
- Phase γ (Tailwind 撤去) でも form 周りは無修正で済む
- 将来 react-hook-form に戻すなら wrapper 内部の field reference を Controller の register に置き換え
