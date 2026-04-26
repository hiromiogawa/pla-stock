import type { Kit, KitStock } from '~/entities/kit'

/**
 * モック層: キット master / kit_stock の in-memory データと CRUD アクセサ。
 *
 * Phase C で実 server fn (createServerFn + Drizzle + D1) に差し替える前提。
 * 関数 signature は server fn 互換形 (async, 入力は1引数オブジェクト) にしておくと
 * 差し替え時の差分が最小になる。
 *
 * mutation は配列を破壊的に書き換える (Phase C では DB INSERT/UPDATE 相当)。
 */

const MOCK_USER_ID = 'mock-user-1'

const kits: Kit[] = [
  {
    id: 'kit-1',
    name: 'RX-78-2 Gundam',
    grade: 'HG',
    scale: '1/144',
    maker: 'Bandai',
    retailPriceYen: 1100,
    janCode: '4573102607317',
    boxArtUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'kit-2',
    name: "Char's Zaku II",
    grade: 'RG',
    scale: '1/144',
    maker: 'Bandai',
    retailPriceYen: 2750,
    janCode: '4573102612922',
    boxArtUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'kit-3',
    name: 'Sazabi Ver.Ka',
    grade: 'MG',
    scale: '1/100',
    maker: 'Bandai',
    retailPriceYen: 11000,
    janCode: '4573102609205',
    boxArtUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'kit-4',
    name: 'Unleashed RX-78-2 Gundam',
    grade: 'PG',
    scale: '1/60',
    maker: 'Bandai',
    retailPriceYen: 27500,
    janCode: '4573102624550',
    boxArtUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'kit-5',
    name: 'Strike Gundam',
    grade: 'EG',
    scale: '1/144',
    maker: 'Bandai',
    retailPriceYen: 770,
    janCode: '4573102591470',
    boxArtUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'kit-6',
    name: 'Custom Old Kit (実家にあった謎のジャンク)',
    grade: 'other',
    scale: 'other',
    maker: 'Bandai',
    retailPriceYen: null,
    janCode: null,
    boxArtUrl: null,
    visibility: 'private',
    ownerId: MOCK_USER_ID,
  },
]

const kitStocks: KitStock[] = [
  {
    id: 'kit-stock-1',
    userId: MOCK_USER_ID,
    kitId: 'kit-1',
    purchasedAt: '2026-02-10',
    purchasePriceYen: 990,
    purchaseLocation: 'ヨドバシ梅田',
    assemblyStatus: 'unbuilt',
    photoUrl: null,
    remark: null,
  },
  {
    id: 'kit-stock-2',
    userId: MOCK_USER_ID,
    kitId: 'kit-2',
    purchasedAt: '2026-03-05',
    purchasePriceYen: 2200,
    purchaseLocation: 'Joshin スーパーキッズランド',
    assemblyStatus: 'building',
    photoUrl: null,
    remark: 'シャア専用カラー再現用にガイア赤系を準備中',
  },
  {
    id: 'kit-stock-3',
    userId: MOCK_USER_ID,
    kitId: 'kit-3',
    purchasedAt: '2025-12-20',
    purchasePriceYen: 9800,
    purchaseLocation: 'Amazon',
    assemblyStatus: 'completed',
    photoUrl: null,
    remark: '完成作。次はディテールアップ予定',
  },
  {
    id: 'kit-stock-4',
    userId: MOCK_USER_ID,
    kitId: 'kit-5',
    purchasedAt: '2026-04-01',
    purchasePriceYen: 770,
    purchaseLocation: 'コンビニ受取',
    assemblyStatus: 'unbuilt',
    photoUrl: null,
    remark: '初心者向けに買ってみた',
  },
  {
    id: 'kit-stock-5',
    userId: MOCK_USER_ID,
    kitId: 'kit-6',
    purchasedAt: null,
    purchasePriceYen: null,
    purchaseLocation: null,
    assemblyStatus: 'unbuilt',
    photoUrl: null,
    remark: 'private item として登録した実家ジャンク',
  },
]

// === Read accessors (Phase C で createServerFn にラップ) ===

/** public カタログ全件 + 自分の private item を返す */
export async function getKits(input: { userId: string }): Promise<Kit[]> {
  return kits.filter(
    (k) => k.visibility === 'public' || k.ownerId === input.userId,
  )
}

/** 単一キット master を ID で取得 (見える範囲内) */
export async function getKit(input: { kitId: string; userId: string }): Promise<Kit | null> {
  const kit = kits.find((k) => k.id === input.kitId)
  if (!kit) return null
  if (kit.visibility === 'public') return kit
  if (kit.ownerId === input.userId) return kit
  return null
}

/** 自分の kit_stock 全件 */
export async function getKitStocks(input: { userId: string }): Promise<KitStock[]> {
  return kitStocks.filter((s) => s.userId === input.userId)
}

/** 自分の kit_stock 単一取得 */
export async function getKitStock(input: { stockId: string; userId: string }): Promise<KitStock | null> {
  const stock = kitStocks.find((s) => s.id === input.stockId && s.userId === input.userId)
  return stock ?? null
}

// === Mutations (in-memory; Phase C では DB INSERT/UPDATE/DELETE) ===

let kitIdCounter = kits.length + 1
let kitStockIdCounter = kitStocks.length + 1

/** 新規 private kit を作成 (master に無いキットを自分用に追加する時) */
export async function addPrivateKit(input: {
  userId: string
  name: string
  grade: Kit['grade']
  scale: Kit['scale']
  maker: string
  retailPriceYen?: number | null
  janCode?: string | null
}): Promise<Kit> {
  const newKit: Kit = {
    id: `kit-${kitIdCounter++}`,
    name: input.name,
    grade: input.grade,
    scale: input.scale,
    maker: input.maker,
    retailPriceYen: input.retailPriceYen ?? null,
    janCode: input.janCode ?? null,
    boxArtUrl: null,
    visibility: 'private',
    ownerId: input.userId,
  }
  kits.push(newKit)
  return newKit
}

/** 既存キット (public master or 自分の private) を在庫に追加 */
export async function addKitStock(input: {
  userId: string
  kitId: string
  purchasedAt?: string | null
  purchasePriceYen?: number | null
  purchaseLocation?: string | null
  remark?: string | null
}): Promise<KitStock> {
  const newStock: KitStock = {
    id: `kit-stock-${kitStockIdCounter++}`,
    userId: input.userId,
    kitId: input.kitId,
    purchasedAt: input.purchasedAt ?? null,
    purchasePriceYen: input.purchasePriceYen ?? null,
    purchaseLocation: input.purchaseLocation ?? null,
    assemblyStatus: 'unbuilt',
    photoUrl: null,
    remark: input.remark ?? null,
  }
  kitStocks.push(newStock)
  return newStock
}

/** kit_stock を更新 (assembly_status / remark / 購入情報) */
export async function updateKitStock(input: {
  stockId: string
  userId: string
  patch: Partial<Pick<KitStock, 'assemblyStatus' | 'remark' | 'purchasedAt' | 'purchasePriceYen' | 'purchaseLocation' | 'photoUrl'>>
}): Promise<KitStock | null> {
  const idx = kitStocks.findIndex((s) => s.id === input.stockId && s.userId === input.userId)
  if (idx === -1) return null
  kitStocks[idx] = { ...kitStocks[idx], ...input.patch }
  return kitStocks[idx]
}

/** kit_stock を削除 */
export async function deleteKitStock(input: { stockId: string; userId: string }): Promise<boolean> {
  const idx = kitStocks.findIndex((s) => s.id === input.stockId && s.userId === input.userId)
  if (idx === -1) return false
  kitStocks.splice(idx, 1)
  return true
}
