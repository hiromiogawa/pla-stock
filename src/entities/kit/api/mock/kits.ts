import type { Kit, KitStock, KitEvent, KitEventReason } from '../../model'

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
 *
 * マスターは admin curated only（private item 概念廃止 2026-04-24）。
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
  },
]

/**
 * kit_stocks: (userId, kitId) per 1 行のカウント。
 * kit-2, kit-3 はプロジェクトが消費して count=0。
 */
const kitStocks: KitStock[] = [
  { userId: MOCK_USER_ID, kitId: 'kit-1', count: 1 },
  { userId: MOCK_USER_ID, kitId: 'kit-2', count: 0 }, // project-2 (シャアザク) が消費
  { userId: MOCK_USER_ID, kitId: 'kit-3', count: 0 }, // project-1 (Sazabi) が消費
  { userId: MOCK_USER_ID, kitId: 'kit-5', count: 1 },
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
]

// === Read accessors (Phase C で createServerFn にラップ) ===

/** カタログ全件を返す (admin curated only) */
export async function getKits(_input: { userId: string }): Promise<Kit[]> {
  return kits
}

/** 単一キット master を ID で取得 */
export async function getKit(input: { kitId: string; userId: string }): Promise<Kit | null> {
  return kits.find((kit) => kit.id === input.kitId) ?? null
}

/** (userId, kitId) composite key で kit_stock 1 行を取得 */
export async function getKitStock(input: {
  userId: string
  kitId: string
}): Promise<KitStock | null> {
  return (
    kitStocks.find((stock) => stock.userId === MOCK_USER_ID && stock.kitId === input.kitId) ?? null
  )
}

/** user の count > 0 の kit_stock のみ返す */
export async function getKitStocksWithStock(_input: { userId: string }): Promise<KitStock[]> {
  return kitStocks.filter((stock) => stock.userId === MOCK_USER_ID && stock.count > 0)
}

/** kit_event 履歴を (userId, kitId) で取得 */
export async function getKitEvents(input: { userId: string; kitId: string }): Promise<KitEvent[]> {
  return kitEvents.filter((event) => event.userId === MOCK_USER_ID && event.kitId === input.kitId)
}

/** user の全 kit_event を返す (Dashboard 集計用) */
export async function getKitEventsAll(_input: { userId: string }): Promise<KitEvent[]> {
  return kitEvents.filter((event) => event.userId === MOCK_USER_ID)
}

// === Mutations (in-memory; Phase C では DB INSERT/UPDATE/DELETE) ===

let kitEventIdCounter = kitEvents.length + 1

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
    (existing) => existing.userId === MOCK_USER_ID && existing.kitId === input.kitId,
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
