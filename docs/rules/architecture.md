# architecture

pla-stock のアーキテクチャ規約。FSD (Feature-Sliced Design) 類似の 6 レイヤー構造を採用し、`.dependency-cruiser.cjs` で機械強制。

> **FSD 自体の概念・原典は公式ドキュメント参照**: <https://feature-sliced.design/>
> 本ファイルは pla-stock 固有の **delta** (層構成 / 採用ルール / 機械強制実装) のみを記す。FSD の概念定義 (Layers / Slices / Segments、Public API 規約、Cross-import ルール等) は公式 docs が SSoT。

## FSD レイヤー

依存方向は下から上 (上位レイヤーは下位を import 可、逆は不可):

```
routes/      ← TanStack Router route files (Container 役)
  ↑
views/       ← Page-level View (Presenter)
  ↑
widgets/     ← 複合 UI (header / sidebar 等)
  ↑
features/    ← user 動作単位 (mutation / form / dialog)
  ↑
entities/    ← domain (kit / paint / project / 中間 entity)
  ↑
shared/      ← 横断 (ui / lib / config / api 基盤)
```

各レイヤーの責務 (詳細は `.dependency-cruiser.cjs`):

- **`shared/`**: domain 非依存。UI primitives (`shared/ui/`)、ライブラリ wrapper (`shared/lib/db`, `shared/lib/r2`)、共通 hooks / utils
- **`entities/<domain>/`**: domain のデータ・型・schema。`schema.ts` が SSoT (詳細 [domain-modeling.md](./domain-modeling.md))。`api/` が server fn、`model.ts` が UI labels
- **`features/<feature>/`**: 1 user 動作 (mutation 起点が typical)。dialog / form / handler を含む
- **`widgets/`**: 複数 entity / feature を横断する compound UI (Sidebar / TopBar 等)
- **`views/<page>View.tsx`**: page-level **pure Presenter**。`*View.tsx` は features を直 import しない (depcruise rule `fsd-view-component-no-features-direct`)
- **`routes/`**: TanStack Router route files。Container 役: `useLoaderData()` → `useXxx(input)` → `<XxxView {...} />`

## Container / Hook / Presenter 分離

mutation や 3 個以上の useState、async handler を持つ view は **Container / Hook / Presenter** に分離:

- **Container = route file (`routes/.../route.tsx`)**: loader → hook → Presenter の組み立て
- **Hook (`useXxx.ts`)**: state + handler + mutation 呼び出し + `router.invalidate()` で loader 再取得
- **Presenter (`XxxView.tsx`)**: pure (props in / JSX out のみ)。`useState` / `useEffect` / mutation 直呼び禁止

例:

```tsx
// routes/kits/$id/route.tsx (Container)
export const Route = createFileRoute('/kits/$id')({
  loader: async ({ params }) => loadKitDetail(params.id),
  component: () => {
    const data = Route.useLoaderData()
    const hookProps = useKitDetail(data.kit)
    return <KitDetailView {...data} {...hookProps} />
  },
})

// views/kits/useKitDetail.ts (Hook)
export function useKitDetail(kit: Kit) {
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const router = useRouter()
  const onPurchase = async (input) => {
    await addKitEvent({ kitId: kit.id, delta: +1, reason: 'purchase', ...input })
    router.invalidate()
    setIsPurchaseDialogOpen(false)
  }
  return { isPurchaseDialogOpen, setIsPurchaseDialogOpen, onPurchase }
}

// views/kits/KitDetailView.tsx (Presenter)
export function KitDetailView({ kit, isPurchaseDialogOpen, ... }: Props) {
  return (/* pure JSX */)
}
```

**List view (filter state のみ) は inline 維持 OK** (`useXxxList` hook 化までは不要)。

## 強制方法

| 範囲 | 強制 | 状態 |
|---|---|---|
| View 本体 (`*View.tsx`) → `~/features/*` 直 import 禁止 | depcruise rule `fsd-view-component-no-features-direct` | ✅ 機械強制 (CI / pre-commit) |
| ライブラリ仕様の自然誘導 (TanStack Router の `useLoaderData` は route 階層 = Container のみ) | フレームワーク仕様 | ✅ 構造的 |
| Presenter 内の react named import (`useState` 等) 禁止 | review 担保 | ⚠️ 意識的選択 (ADR-0023 で OSS 採用見送り確定、dual lint コスト > paper tiger リスクと判断) |

## 関連

- 設計経緯: ADR-0019 (Container/Hook/Presenter 規約)
- 機械強制実装: `.dependency-cruiser.cjs` (FSD レイヤールール)
- 関連 issue: #43 (規約導入)、#155 (paper tiger 解消)、#218 (depcruise rule 機械強制化)、#217 (named import OSS 検討、ADR-0023 で見送り確定)
