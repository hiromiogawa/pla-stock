import type { Kit, KitStock, KitEvent } from '../../model'

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

export const mockKits: Kit[] = [
  {
    id: 'kit-1',
    name: 'RX-78-2 Gundam',
    grade: 'HG',
    scale: '1/144',
    retailPriceYen: 1100,
    boxArtUrl: null,
  },
  {
    id: 'kit-2',
    name: "Char's Zaku II",
    grade: 'RG',
    scale: '1/144',
    retailPriceYen: 2750,
    boxArtUrl: null,
  },
  {
    id: 'kit-3',
    name: 'Sazabi Ver.Ka',
    grade: 'MG',
    scale: '1/100',
    retailPriceYen: 11000,
    boxArtUrl: null,
  },
  {
    id: 'kit-4',
    name: 'Unleashed RX-78-2 Gundam',
    grade: 'PG',
    scale: '1/60',
    retailPriceYen: 27500,
    boxArtUrl: null,
  },
  {
    id: 'kit-5',
    name: 'Strike Gundam',
    grade: 'EG',
    scale: '1/144',
    retailPriceYen: 770,
    boxArtUrl: null,
  },
]

/**
 * kit_stocks: (userId, kitId) per 1 行のカウント。
 * kit-2, kit-3 はプロジェクトが消費して count=0。
 */
export const mockKitStocks: KitStock[] = [
  { userId: MOCK_USER_ID, kitId: 'kit-1', count: 1 },
  { userId: MOCK_USER_ID, kitId: 'kit-2', count: 0 }, // project-2 (シャアザク) が消費
  { userId: MOCK_USER_ID, kitId: 'kit-3', count: 0 }, // project-1 (Sazabi) が消費
  { userId: MOCK_USER_ID, kitId: 'kit-5', count: 1 },
]

/**
 * kit_events: 入出庫の audit ledger。
 * SUM(delta) で kitStocks.count が再計算できることを保証する。
 */
export const mockKitEvents: KitEvent[] = [
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
    createdAt: new Date('2026-02-10T10:00:00Z'),
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
    createdAt: new Date('2026-03-05T10:00:00Z'),
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
    createdAt: new Date('2026-03-20T10:00:00Z'),
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
    createdAt: new Date('2025-12-20T10:00:00Z'),
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
    createdAt: new Date('2026-01-05T10:00:00Z'),
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
    createdAt: new Date('2026-04-01T10:00:00Z'),
  },
]

// Mutations は `features/kit-stock-add` (#115) と `features/project-*` (#116) の
// Drizzle server fn に完全移行済み。本ファイルは seed 用 mock 配列のみを保持する。
