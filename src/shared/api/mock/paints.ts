import type { Paint, PaintStock } from '~/entities/paint'

/**
 * モック層: 塗料 master / paint_stock の in-memory データと CRUD アクセサ。
 *
 * Phase C で実 server fn (createServerFn + Drizzle + D1) に差し替える前提。
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
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-2',
    brand: 'Mr.Color',
    code: 'C2',
    name: 'ブラック',
    colorFamily: '黒',
    finishType: '光沢',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-3',
    brand: 'Mr.Color',
    code: 'C8',
    name: 'シルバー',
    colorFamily: '銀',
    finishType: 'メタリック',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-4',
    brand: 'Mr.Color GX',
    code: 'GX100',
    name: 'スーパークリアIII',
    colorFamily: 'クリア',
    finishType: 'クリア',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-5',
    brand: 'Mr.Color',
    code: 'C108',
    name: 'キャラクターレッド',
    colorFamily: '赤',
    finishType: '光沢',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-6',
    brand: 'Mr.Surfacer',
    code: '1500',
    name: 'ブラック サーフェイサー',
    colorFamily: '黒',
    finishType: 'プライマー',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-7',
    brand: 'ガイアカラー',
    code: '001',
    name: 'ピュアホワイト',
    colorFamily: '白',
    finishType: '光沢',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-8',
    brand: 'ガイアカラー',
    code: '073',
    name: 'フレームレッド',
    colorFamily: '赤',
    finishType: '半光沢',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-9',
    brand: 'フィニッシャーズカラー',
    code: 'FC-12',
    name: 'チタンシルバー',
    colorFamily: '銀',
    finishType: 'メタリック',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-10',
    brand: 'Mr.Weathering Color',
    code: 'WC-01',
    name: 'マルチブラック',
    colorFamily: '黒',
    finishType: 'ウェザリング',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
  {
    id: 'paint-11',
    brand: 'Mr.Color',
    code: 'C92',
    name: 'セミグロスブラック',
    colorFamily: '黒',
    finishType: '半光沢',
    swatchUrl: null,
    visibility: 'public',
    ownerId: null,
  },
]

const paintStocks: PaintStock[] = [
  {
    id: 'paint-stock-1',
    userId: MOCK_USER_ID,
    paintId: 'paint-1',
    purchasedAt: '2026-01-15',
    purchasePriceYen: 220,
    status: 'in_use',
    remark: null,
  },
  {
    id: 'paint-stock-2',
    userId: MOCK_USER_ID,
    paintId: 'paint-2',
    purchasedAt: '2026-01-15',
    purchasePriceYen: 220,
    status: 'in_use',
    remark: null,
  },
  {
    id: 'paint-stock-3',
    userId: MOCK_USER_ID,
    paintId: 'paint-3',
    purchasedAt: '2026-01-15',
    purchasePriceYen: 280,
    status: 'new',
    remark: null,
  },
  {
    id: 'paint-stock-4',
    userId: MOCK_USER_ID,
    paintId: 'paint-4',
    purchasedAt: '2026-02-20',
    purchasePriceYen: 440,
    status: 'in_use',
    remark: null,
  },
  {
    id: 'paint-stock-5',
    userId: MOCK_USER_ID,
    paintId: 'paint-5',
    purchasedAt: '2026-03-01',
    purchasePriceYen: 220,
    status: 'in_use',
    remark: 'シャアザク用',
  },
  {
    id: 'paint-stock-6',
    userId: MOCK_USER_ID,
    paintId: 'paint-6',
    purchasedAt: '2025-12-10',
    purchasePriceYen: 770,
    status: 'empty',
    remark: '使い切った',
  },
  {
    id: 'paint-stock-7',
    userId: MOCK_USER_ID,
    paintId: 'paint-8',
    purchasedAt: '2026-03-01',
    purchasePriceYen: 506,
    status: 'in_use',
    remark: 'シャアザク用',
  },
  {
    id: 'paint-stock-8',
    userId: MOCK_USER_ID,
    paintId: 'paint-9',
    purchasedAt: '2026-02-25',
    purchasePriceYen: 660,
    status: 'new',
    remark: null,
  },
  {
    id: 'paint-stock-9',
    userId: MOCK_USER_ID,
    paintId: 'paint-10',
    purchasedAt: '2026-04-10',
    purchasePriceYen: 990,
    status: 'new',
    remark: null,
  },
  {
    id: 'paint-stock-10',
    userId: MOCK_USER_ID,
    paintId: 'paint-11',
    purchasedAt: '2026-01-15',
    purchasePriceYen: 220,
    status: 'in_use',
    remark: null,
  },
]

// === Read accessors ===

export async function getPaints(input: { userId: string }): Promise<Paint[]> {
  return paints.filter(
    (p) => p.visibility === 'public' || p.ownerId === input.userId,
  )
}

export async function getPaint(input: { paintId: string; userId: string }): Promise<Paint | null> {
  const p = paints.find((x) => x.id === input.paintId)
  if (!p) return null
  if (p.visibility === 'public') return p
  if (p.ownerId === input.userId) return p
  return null
}

export async function getPaintStocks(input: { userId: string }): Promise<PaintStock[]> {
  return paintStocks.filter((s) => s.userId === input.userId)
}

export async function getPaintStock(input: { stockId: string; userId: string }): Promise<PaintStock | null> {
  return paintStocks.find((s) => s.id === input.stockId && s.userId === input.userId) ?? null
}

// === Mutations ===

let paintIdCounter = paints.length + 1
let paintStockIdCounter = paintStocks.length + 1

export async function addPrivatePaint(input: {
  userId: string
  brand: string
  code: string
  name: string
  colorFamily?: Paint['colorFamily']
  finishType?: Paint['finishType']
}): Promise<Paint> {
  const newPaint: Paint = {
    id: `paint-${paintIdCounter++}`,
    brand: input.brand,
    code: input.code,
    name: input.name,
    colorFamily: input.colorFamily ?? null,
    finishType: input.finishType ?? null,
    swatchUrl: null,
    visibility: 'private',
    ownerId: input.userId,
  }
  paints.push(newPaint)
  return newPaint
}

export async function addPaintStock(input: {
  userId: string
  paintId: string
  purchasedAt?: string | null
  purchasePriceYen?: number | null
  remark?: string | null
}): Promise<PaintStock> {
  const newStock: PaintStock = {
    id: `paint-stock-${paintStockIdCounter++}`,
    userId: input.userId,
    paintId: input.paintId,
    purchasedAt: input.purchasedAt ?? null,
    purchasePriceYen: input.purchasePriceYen ?? null,
    status: 'new',
    remark: input.remark ?? null,
  }
  paintStocks.push(newStock)
  return newStock
}

export async function updatePaintStock(input: {
  stockId: string
  userId: string
  patch: Partial<Pick<PaintStock, 'status' | 'remark' | 'purchasedAt' | 'purchasePriceYen'>>
}): Promise<PaintStock | null> {
  const idx = paintStocks.findIndex((s) => s.id === input.stockId && s.userId === input.userId)
  if (idx === -1) return null
  paintStocks[idx] = { ...paintStocks[idx], ...input.patch }
  return paintStocks[idx]
}

export async function deletePaintStock(input: { stockId: string; userId: string }): Promise<boolean> {
  const idx = paintStocks.findIndex((s) => s.id === input.stockId && s.userId === input.userId)
  if (idx === -1) return false
  paintStocks.splice(idx, 1)
  return true
}
