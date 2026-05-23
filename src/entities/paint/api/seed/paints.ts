import type { Paint, PaintStock, PaintEvent } from '../../model'

/**
 * seed 層: 塗料 master / paint_stock (count cache) / paint_events (ledger) の
 * 初期投入用 in-memory データ。`src/shared/lib/db/seed.ts` から D1 への
 * truncate-then-insert で利用される (dev seed、production runtime 非対象)。
 *
 * production の read query / mutation は Phase C で Drizzle + D1 server fn に完全移行済み。
 * test fixture とは別系統 (test は `src/test-utils/factories/paint.ts` を使う、ADR-0016)。
 *
 * マスターは admin curated only（private item 概念廃止 2026-04-24）。
 */

const SEED_USER_ID = 'seed-user-1'

export const seedPaints: Paint[] = [
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
export const seedPaintStocks: PaintStock[] = [
  { userId: SEED_USER_ID, paintId: 'paint-1', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-2', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-3', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-4', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-5', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-6', count: 0 }, // 使い切り (空)
  { userId: SEED_USER_ID, paintId: 'paint-8', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-9', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-10', count: 1 },
  { userId: SEED_USER_ID, paintId: 'paint-11', count: 1 },
]

/**
 * paint_events: 入出庫の audit ledger。
 * SUM(delta) で paintStocks.count が再計算できることを保証する。
 */
export const seedPaintEvents: PaintEvent[] = [
  {
    id: 'pe-1',
    userId: SEED_USER_ID,
    paintId: 'paint-1',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 220,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-01-15T10:00:00Z'),
  },
  {
    id: 'pe-2',
    userId: SEED_USER_ID,
    paintId: 'paint-2',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 220,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-01-15T10:01:00Z'),
  },
  {
    id: 'pe-3',
    userId: SEED_USER_ID,
    paintId: 'paint-3',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 280,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-01-15T10:02:00Z'),
  },
  {
    id: 'pe-4',
    userId: SEED_USER_ID,
    paintId: 'paint-4',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-02-20',
    priceYen: 440,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-02-20T10:00:00Z'),
  },
  {
    id: 'pe-5',
    userId: SEED_USER_ID,
    paintId: 'paint-5',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-03-01',
    priceYen: 220,
    purchaseLocation: null,
    note: 'シャアザク用',
    createdAt: new Date('2026-03-01T10:00:00Z'),
  },
  // paint-6: 購入 +1
  {
    id: 'pe-6',
    userId: SEED_USER_ID,
    paintId: 'paint-6',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2025-12-10',
    priceYen: 770,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2025-12-10T10:00:00Z'),
  },
  // paint-6: 使い切り廃棄 -1 → count=0
  {
    id: 'pe-7',
    userId: SEED_USER_ID,
    paintId: 'paint-6',
    delta: -1,
    reason: 'discard',
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: 'used up',
    createdAt: new Date('2026-03-01T10:00:00Z'),
  },
  {
    id: 'pe-8',
    userId: SEED_USER_ID,
    paintId: 'paint-8',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-03-01',
    priceYen: 506,
    purchaseLocation: null,
    note: 'シャアザク用',
    createdAt: new Date('2026-03-01T10:01:00Z'),
  },
  {
    id: 'pe-9',
    userId: SEED_USER_ID,
    paintId: 'paint-9',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-02-25',
    priceYen: 660,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-02-25T10:00:00Z'),
  },
  {
    id: 'pe-10',
    userId: SEED_USER_ID,
    paintId: 'paint-10',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-04-10',
    priceYen: 990,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-04-10T10:00:00Z'),
  },
  {
    id: 'pe-11',
    userId: SEED_USER_ID,
    paintId: 'paint-11',
    delta: 1,
    reason: 'purchase',
    purchasedAt: '2026-01-15',
    priceYen: 220,
    purchaseLocation: null,
    note: null,
    createdAt: new Date('2026-01-15T10:03:00Z'),
  },
]
