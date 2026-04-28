export type {
  Paint,
  PaintStock,
  PaintEvent,
  PaintEventReason,
  ColorFamily,
  FinishType,
} from './model'
export { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES } from './model'
export {
  getPaints,
  getPaint,
  getPaintStock,
  getPaintStocksWithStock,
  getPaintEvents,
  getPaintEventsAll,
  addPaintEvent,
} from './api/mock/paints'
