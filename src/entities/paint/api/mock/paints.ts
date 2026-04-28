import type { Paint, PaintStock, PaintEvent, PaintEventReason } from '../../model'

/**
 * モック層: 塗料 master / paint_stock (count cache) / paint_events (ledger) の
 * in-memory データと CRUD アクセサ。
 *
 * 在庫モデルを per-unit → count + event log pattern に統一 (2026-04-27)。
 * Phase C で実 server fn (createServerFn + Drizzle + D1) に差し替える前提。
 *
 * マスターは admin curated only（private item 概念廃止 2026-04-24）。
 */

const MOCK_USER_ID = 'mock-user-1'

const paints: Paint[] = [
  {
    id: 'paint-1',
    brand: 'Mr.Color',
    code: 'C1',
    name: 'ホワイト',
    colorFamily: '白',
    finishType: '光沢',
    swatchUrl: null,
  },
  {
    id: 'paint-2',
    brand: 'Mr.Color',
    code: 'C2',
    name: 'ブラック',
    colorFamily: '黒',
    finishType: '光沢',
    swatchUrl: null,
  },
  {
    id: 'paint-3',
    brand: 'Mr.Color',
    code: 'C8',
    name: 'シルバー',
    colorFamily: '銀',
    finishType: 'メタリック',
    swatchUrl: null,
  },
  {
    id: 'paint-4',
    brand: 'Mr.Color GX',
    code: 'GX100',
    name: 'スーパークリアIII',
    colorFamily: 'クリア',
    finishType: 'クリア',
    swatchUrl: null,
  },
  {
    id: 'paint-5',
    brand: 'Mr.Color',
    code: 'C108',
    name: 'キャラクターレッド',
    colorFamily: '赤',
    finishType: '光沢',
    swatchUrl: null,
  },
  {
    id: 'paint-6',
    brand: 'Mr.Surfacer',
    code: '1500',
    name: 'ブラック サーフェイサー',
    colorFamily: '黒',
    finishType: 'プライマー',
    swatchUrl: null,
  },
  {
    id: 'paint-7',
    brand: 'ガイアカラー',
    code: '001',
    name: 'ピュアホワイト',
    colorFamily: '白',
    finishType: '光沢',
    swatchUrl: null,
  },
  {
    id: 'paint-8',
    brand: 'ガイアカラー',
    code: '073',
    name: 'フレームレッド',
    colorFamily: '赤',
    finishType: '半光沢',
    swatchUrl: null,
  },
  {
    id: 'paint-9',
    brand: 'フィニッシャーズカラー',
    code: 'FC-12',
    name: 'チタンシルバー',
    colorFamily: '銀',
    finishType: 'メタリック',
    swatchUrl: null,
  },
  {
    id: 'paint-10',
    brand: 'Mr.Weathering Color',
    code: 'WC-01',
    name: 'マルチブラック',
    colorFamily: '黒',
    finishType: 'ウェザリング',
    swatchUrl: null,
  },
  {
    id: 'paint-11',
    brand: 'Mr.Color',
    code: 'C92',
    name: 'セミグロスブラック',
    colorFamily: '黒',
    finishType: '半光沢',
    swatchUrl: null,
  },
]

/**
 * paint_stocks: (userId, paintId) per 1 行のカウント。
 * 旧 per-bottle 10 行 → 新 10 (user, paint) pair。
 * paint-6 (Mr.Surfacer) は使い切って count=0。
 * paint-7 は旧データにストックなし (未登録)。
 */
const paintStocks: PaintStock[] = [
  { userId: MOCK_USER_ID, paintId: 'paint-1', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-2', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-3', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-4', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-5', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-6', count: 0 }, // 使い切り (空)
  { userId: MOCK_USER_ID, paintId: 'paint-8', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-9', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-10', count: 1 },
  { userId: MOCK_USER_ID, paintId: 'paint-11', count: 1 },
]

/**
 * paint_events: 入出庫の audit ledger。
 * SUM(delta) で paintStocks.count が再計算できることを保証する。
 */
const paintEvents: PaintEvent[] = [
  {
    id: 'pe-1',
    userId: MOCK_USER_ID,
    paintId: 'paint-1',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 220,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'pe-2',
    userId: MOCK_USER_ID,
    paintId: 'paint-2',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 220,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-01-15T10:01:00Z',
  },
  {
    id: 'pe-3',
    userId: MOCK_USER_ID,
    paintId: 'paint-3',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 280,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-01-15T10:02:00Z',
  },
  {
    id: 'pe-4',
    userId: MOCK_USER_ID,
    paintId: 'paint-4',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-02-20',
    priceYen: 440,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'pe-5',
    userId: MOCK_USER_ID,
    paintId: 'paint-5',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-03-01',
    priceYen: 220,
    purchaseLocation: null,
    note: 'シャアザク用',
    createdAt: '2026-03-01T10:00:00Z',
  },
  // paint-6: 購入 +1
  {
    id: 'pe-6',
    userId: MOCK_USER_ID,
    paintId: 'paint-6',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2025-12-10',
    priceYen: 770,
    purchaseLocation: null,
    note: null,
    createdAt: '2025-12-10T10:00:00Z',
  },
  // paint-6: 使い切り廃棄 -1 → count=0
  {
    id: 'pe-7',
    userId: MOCK_USER_ID,
    paintId: 'paint-6',
    delta: -1,
    reason: 'discard',
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: 'used up',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'pe-8',
    userId: MOCK_USER_ID,
    paintId: 'paint-8',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-03-01',
    priceYen: 506,
    purchaseLocation: null,
    note: 'シャアザク用',
    createdAt: '2026-03-01T10:01:00Z',
  },
  {
    id: 'pe-9',
    userId: MOCK_USER_ID,
    paintId: 'paint-9',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-02-25',
    priceYen: 660,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'pe-10',
    userId: MOCK_USER_ID,
    paintId: 'paint-10',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-04-10',
    priceYen: 990,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'pe-11',
    userId: MOCK_USER_ID,
    paintId: 'paint-11',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 220,
    purchaseLocation: null,
    note: null,
    createdAt: '2026-01-15T10:03:00Z',
  },
]

// === Read accessors ===

/** カタログ全件を返す (admin curated only) */
export async function getPaints(_input: { userId: string }): Promise<Paint[]> {
  return paints
}

/** 単一塗料 master を ID で取得 */
export async function getPaint(input: { paintId: string; userId: string }): Promise<Paint | null> {
  return paints.find((x) => x.id === input.paintId) ?? null
}

/** (userId, paintId) composite key で paint_stock 1 行を取得 */
export async function getPaintStock(input: {
  userId: string
  paintId: string
}): Promise<PaintStock | null> {
  return paintStocks.find((s) => s.userId === MOCK_USER_ID && s.paintId === input.paintId) ?? null
}

/** user の count > 0 の paint_stock のみ返す */
export async function getPaintStocksWithStock(_input: { userId: string }): Promise<PaintStock[]> {
  return paintStocks.filter((s) => s.userId === MOCK_USER_ID && s.count > 0)
}

/** paint_event 履歴を (userId, paintId) で取得 */
export async function getPaintEvents(input: {
  userId: string
  paintId: string
}): Promise<PaintEvent[]> {
  return paintEvents.filter((e) => e.userId === MOCK_USER_ID && e.paintId === input.paintId)
}

// === Mutations ===

let paintEventIdCounter = paintEvents.length + 1

/**
 * paint_event を追加し、paint_stock の count を更新する。
 *
 * - delta=0 は禁止 (throw)。
 * - 結果 count < 0 は禁止 (throw)。
 * - paint_stock 行が未存在なら自動作成 (count = delta)。
 */
export async function addPaintEvent(input: {
  userId: string
  paintId: string
  delta: number
  reason: PaintEventReason
  purchasedAt?: string | null
  priceYen?: number | null
  purchaseLocation?: string | null
  note?: string | null
}): Promise<PaintEvent> {
  if (input.delta === 0) {
    throw new Error('addPaintEvent: delta must be non-zero')
  }

  let stock = paintStocks.find((s) => s.userId === MOCK_USER_ID && s.paintId === input.paintId)
  if (!stock) {
    stock = { userId: MOCK_USER_ID, paintId: input.paintId, count: 0 }
    paintStocks.push(stock)
  }

  const newCount = stock.count + input.delta
  if (newCount < 0) {
    throw new Error(
      `addPaintEvent: result count would be ${newCount} (< 0). Current count: ${stock.count}, delta: ${input.delta}`,
    )
  }

  stock.count = newCount

  const newEvent: PaintEvent = {
    id: `pe-${paintEventIdCounter++}`,
    userId: MOCK_USER_ID,
    paintId: input.paintId,
    delta: input.delta,
    reason: input.reason,
    purchasedAt: input.purchasedAt ?? null,
    priceYen: input.priceYen ?? null,
    purchaseLocation: input.purchaseLocation ?? null,
    note: input.note ?? null,
    createdAt: new Date().toISOString(),
  }
  paintEvents.push(newEvent)
  return newEvent
}
