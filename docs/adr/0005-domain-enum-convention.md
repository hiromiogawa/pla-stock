# ADR-0005: Domain enum 集約規約 (values + 型派生 + labels)

- ステータス: 承認
- 日付: 2026-05-01
- 関連: Issue #79 (規約確立) / Issue #80 (cleanup 実装) / FAIL-001 (ADR-0007)

## 文脈

ドメインの離散的な状態 (event reason, status, category, finishType 等) は **TypeScript の literal union 型** で表現してきた。

```ts
// src/entities/kit/model.ts (現状)
export type KitEventReason = 'purchase' | 'project' | 'gift' | 'sell' | 'discard' | 'other'
```

しかし型のみ export していたため、その値リストが必要な場面 (`<select>` の options、Zod `z.enum`、ループ処理) で **利用側 (主に dialog / view) が literal array を再宣言** していた。

```ts
// src/views/KitDetailView/KitReleaseDialog.tsx (#76 時点)
const REASON_OPTIONS: FormSelectOption[] = [
  { value: 'gift', label: '譲渡' },
  { value: 'sell', label: '売却' },
  { value: 'discard', label: '廃棄' },
  { value: 'other', label: 'その他' },
]
const RELEASE_REASON_VALUES = ['gift', 'sell', 'discard', 'other'] as const satisfies ...
```

問題点:

1. **layer 違反**: dialog (presentation) が domain enumeration の知識を持つ
2. **drift 危険**: 型に新しい値を追加しても、利用側の値リストは自動更新されない
3. **重複**: 同一の値リストが `REASON_OPTIONS` (label 付き) と `RELEASE_REASON_VALUES` (Zod 用) で 2 重宣言
4. **横展開**: kit / paint 両方の dialog が同型の重複を抱える

レビュー (#78 / Issue #79) で「entities/ 側が値を export していないのが原因」と特定。本 ADR で集約規約を確立する。

## 決定

ドメインの離散値は **entities/{domain}/model.ts (またはその近接ファイル) に以下の 3 点セットで集約** する:

1. **`{DOMAIN}_{KIND}S` const tuple**: 値リスト (SSoT)
2. **`{Domain}{Kind}` 型**: tuple から派生 (`typeof X[number]`)
3. **`{DOMAIN}_{KIND}_LABELS` const Record**: 表示 label map (`satisfies Record<Type, string>`)

### テンプレート

```ts
// src/entities/kit/model.ts
export const KIT_EVENT_REASONS = [
  'purchase',
  'project',
  'gift',
  'sell',
  'discard',
  'other',
] as const

export type KitEventReason = (typeof KIT_EVENT_REASONS)[number]

export const KIT_EVENT_REASON_LABELS = {
  purchase: '購入',
  project: 'プロジェクト',
  gift: '譲渡',
  sell: '売却',
  discard: '廃棄',
  other: 'その他',
} as const satisfies Record<KitEventReason, string>
```

### 利用側

```ts
// src/views/KitDetailView/KitReleaseDialog.tsx
import {
  KIT_EVENT_REASONS,
  KIT_EVENT_REASON_LABELS,
  type KitEventReason,
} from '~/entities/kit'

// release reason は purchase / project を除外した subset
const RELEASE_REASONS = [
  'gift',
  'sell',
  'discard',
  'other',
] as const satisfies readonly KitEventReason[]

const REASON_OPTIONS = RELEASE_REASONS.map((value) => ({
  value,
  label: KIT_EVENT_REASON_LABELS[value],
}))

const schema = z.object({
  reason: z.enum(RELEASE_REASONS),
  // ...
})
```

subset (`RELEASE_REASONS`) は domain の純粋な subset を表現するため **entity に置く案もある**が、subset の切り分けが「UI の責務」(release dialog でだけ使う) ならば dialog 内に置いて `satisfies readonly KitEventReason[]` で型整合だけ守る形でよい。**判断基準: 同じ subset を 2 箇所以上で使うなら entity 側に昇格**。

### 強制レベル

- **規約レベル** (人間 + AI が ADR + CLAUDE.md を参照して守る)
- 機械強制 (oxlint custom rule / dep-cruiser) は **採用しない**: ルール記述コストが高く、メンテ負債になりやすい
- AI agent には ADR-0007 (FAIL-001) として記録、`failure-record` skill 経由で再発を抑止

## 採用しなかった選択肢

| 選択肢 | 却下理由 |
|---|---|
| 型のみ export を維持 (現状) | 利用側で literal を再宣言、drift / 重複が不可避 (本 ADR の起点) |
| labels も含めて全て利用側 view 内で定義 | 同じ labels が複数 view で重複、変更時に grep して回る羽目に |
| labels は i18n システムに切り出し | 現状日本語のみで i18n 機構なし、過剰 |
| `Object.keys(LABELS)` で values を導出 | `string[]` に widening、Zod tuple 要件を満たせず `as` が必要 (lint NG) |
| `enum` (TS native) | 値ベース enum は tree-shake 不利、リテラル union のほうが軽量 |
| dep-cruiser 機械強制 (views/ で literal array 禁止) | ルール記述が脆弱で false positive 多発の懸念、メンテコスト > 期待効果 |

## 結果

- 利用側 (dialog / view) は **import するだけ** で値・型・labels を取り出せる
- `KIT_EVENT_REASONS` を編集すると `KitEventReason` 型と labels record の両方が更新を要求 (TS error / satisfies 違反) → 編集忘れが起きない
- Zod `z.enum(KIT_EVENT_REASONS)` でそのまま使える
- 同じ値・labels を 2 view で参照しても entity が SSoT
- `domain enum を新規追加するときは values + 型 + labels の 3 点セット` がレビュー視点として明示される (CLAUDE.md と ADR-0007 で再発防止)

## 残課題 (本 ADR スコープ外)

- 既存の `KitEventReason` / `PaintEventReason` / 各 status type の cleanup → Issue #80
- 状況に応じて status / finishType / colorFamily 等の他 domain enum も同パターンへ移行 → Issue #80 で副次調査
