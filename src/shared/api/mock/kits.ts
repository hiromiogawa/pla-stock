import type { Kit, KitStock, KitEvent, KitEventReason } from '~/entities/kit'

/**
 * モック層: キット master / kit_stock (count cache) / kit_events (ledger) の
 * in-memory データと CRUD アクセサ。
 *
 * 在庫モデルを per-unit → count + event log pattern に統一 (2026-04-27)。
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

/**
 * kit_stocks: (userId, kitId) per 1 行のカウント。
 * 旧 per-unit 5 行 → 新 5 (user, kit) pair。
 * kit-2, kit-3 はプロジェクトが消費して count=0。
 */
const kitStocks: KitStock[] = [
  { userId: MOCK_USER_ID, kitId: 'kit-1', count: 1 },
  { userId: MOCK_USER_ID, kitId: 'kit-2', count: 0 }, // project-2 (シャアザク) が消費
  { userId: MOCK_USER_ID, kitId: 'kit-3', count: 0 }, // project-1 (Sazabi) が消費
  { userId: MOCK_USER_ID, kitId: 'kit-5', count: 1 },
  { userId: MOCK_USER_ID, kitId: 'kit-6', count: 1 },
]

/**
 * kit_events: 入出庫の audit ledger。
 * SUM(delta) で kitStocks.count が再計算できることを保証する。
 */
const kitEvents: KitEvent[] = [
  // kit-1: 購入 +1 → count=1
  {
    id: 'ke-1',
    userId: MOCK_USER_ID,
    kitId: 'kit-1',
    delta: 1,
    reason: 'purchase',
    projectId: null,
    purchasedAt: '2026-02-10',
    priceYen: 990,
    purchaseLocation: 'ヨドバシ梅田',
    note: null,
    createdAt: '2026-02-10T10:00:00Z',
  },
  // kit-2: 購入 +1
  {
    id: 'ke-2',
    userId: MOCK_USER_ID,
    kitId: 'kit-2',
    delta: 1,
    reason: 'purchase',
    projectId: null,
    purchasedAt: '2026-03-05',
    priceYen: 2200,
    purchaseLocation: 'Joshin スーパーキッズランド',
    note: 'シャア専用カラー再現用にガイア赤系を準備中',
    createdAt: '2026-03-05T10:00:00Z',
  },
  // kit-2: project-2 (シャアザク) に消費 -1 → count=0
  {
    id: 'ke-3',
    userId: MOCK_USER_ID,
    kitId: 'kit-2',
    delta: -1,
    reason: 'project',
    projectId: 'project-2',
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-03-20T10:00:00Z',
  },
  // kit-3: 購入 +1
  {
    id: 'ke-4',
    userId: MOCK_USER_ID,
    kitId: 'kit-3',
    delta: 1,
    reason: 'purchase',
    projectId: null,
    purchasedAt: '2025-12-20',
    priceYen: 9800,
    purchaseLocation: 'Amazon',
    note: null,
    createdAt: '2025-12-20T10:00:00Z',
  },
  // kit-3: project-1 (Sazabi) に消費 -1 → count=0
  {
    id: 'ke-5',
    userId: MOCK_USER_ID,
    kitId: 'kit-3',
    delta: -1,
    reason: 'project',
    projectId: 'project-1',
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-01-05T10:00:00Z',
  },
  // kit-5: 購入 +1 → count=1
  {
    id: 'ke-6',
    userId: MOCK_USER_ID,
    kitId: 'kit-5',
    delta: 1,
    reason: 'purchase',
    projectId: null,
    purchasedAt: '2026-04-01',
    priceYen: 770,
    purchaseLocation: 'コンビニ受取',
    note: '初心者向けに買ってみた',
    createdAt: '2026-04-01T10:00:00Z',
  },
  // kit-6: 入手 (private item) +1 → count=1
  {
    id: 'ke-7',
    userId: MOCK_USER_ID,
    kitId: 'kit-6',
    delta: 1,
    reason: 'gift',
    projectId: null,
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: 'private item として登録した実家ジャンク',
    createdAt: '2026-01-01T00:00:00Z',
  },
]

// === Read accessors (Phase C で createServerFn にラップ) ===

/** public カタログ全件 + 自分の private item を返す */
export async function getKits(input: { userId: string }): Promise<Kit[]> {
  return kits.filter(
    (k) => k.visibility === 'public' || k.ownerId === MOCK_USER_ID,
  )
}

/** 単一キット master を ID で取得 (見える範囲内) */
export async function getKit(input: { kitId: string; userId: string }): Promise<Kit | null> {
  const kit = kits.find((k) => k.id === input.kitId)
  if (!kit) return null
  if (kit.visibility === 'public') return kit
  if (kit.ownerId === MOCK_USER_ID) return kit
  return null
}

/** (userId, kitId) composite key で kit_stock 1 行を取得 */
export async function getKitStock(input: { userId: string; kitId: string }): Promise<KitStock | null> {
  return kitStocks.find(
    (s) => s.userId === MOCK_USER_ID && s.kitId === input.kitId,
  ) ?? null
}

/** user の全 kit_stock を返す */
export async function getKitStocksAll(input: { userId: string }): Promise<KitStock[]> {
  return kitStocks.filter((s) => s.userId === MOCK_USER_ID)
}

/** user の count > 0 の kit_stock のみ返す */
export async function getKitStocksWithStock(input: { userId: string }): Promise<KitStock[]> {
  return kitStocks.filter((s) => s.userId === MOCK_USER_ID && s.count > 0)
}

/** kit_event 履歴を (userId, kitId) で取得 */
export async function getKitEvents(input: { userId: string; kitId: string }): Promise<KitEvent[]> {
  return kitEvents.filter(
    (e) => e.userId === MOCK_USER_ID && e.kitId === input.kitId,
  )
}

// === Compute ===

/** events から count を再計算 (整合性チェック用) */
export async function recomputeKitStockCount(input: {
  userId: string
  kitId: string
}): Promise<number> {
  const events = await getKitEvents(input)
  return events.reduce((sum, e) => sum + e.delta, 0)
}

// === Mutations (in-memory; Phase C では DB INSERT/UPDATE/DELETE) ===

let kitIdCounter = kits.length + 1
let kitEventIdCounter = kitEvents.length + 1

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
    ownerId: MOCK_USER_ID,
  }
  kits.push(newKit)
  return newKit
}

/**
 * kit_event を追加し、kit_stock の count を更新する。
 *
 * - delta=0 は禁止 (throw)。
 * - 結果 count < 0 は禁止 (throw)。
 * - kit_stock 行が未存在なら自動作成 (count = delta)。
 */
export async function addKitEvent(input: {
  userId: string
  kitId: string
  delta: number
  reason: KitEventReason
  projectId?: string | null
  purchasedAt?: string | null
  priceYen?: number | null
  purchaseLocation?: string | null
  note?: string | null
}): Promise<KitEvent> {
  if (input.delta === 0) {
    throw new Error('addKitEvent: delta must be non-zero')
  }

  // kit_stock を探すまたは作成
  let stock = kitStocks.find(
    (s) => s.userId === MOCK_USER_ID && s.kitId === input.kitId,
  )
  if (!stock) {
    stock = { userId: MOCK_USER_ID, kitId: input.kitId, count: 0 }
    kitStocks.push(stock)
  }

  const newCount = stock.count + input.delta
  if (newCount < 0) {
    throw new Error(
      `addKitEvent: result count would be ${newCount} (< 0). Current count: ${stock.count}, delta: ${input.delta}`,
    )
  }

  // count 更新
  stock.count = newCount

  const newEvent: KitEvent = {
    id: `ke-${kitEventIdCounter++}`,
    userId: MOCK_USER_ID,
    kitId: input.kitId,
    delta: input.delta,
    reason: input.reason,
    projectId: input.projectId ?? null,
    purchasedAt: input.purchasedAt ?? null,
    priceYen: input.priceYen ?? null,
    purchaseLocation: input.purchaseLocation ?? null,
    note: input.note ?? null,
    createdAt: new Date().toISOString(),
  }
  kitEvents.push(newEvent)
  return newEvent
}
