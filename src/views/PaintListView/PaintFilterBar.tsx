import type { ColorFamily, FinishType, PaintStatus } from '~/entities/paint'
import { Input } from '~/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/ui/select'

export interface PaintFilters {
  search: string
  brand: string | 'all'
  colorFamily: ColorFamily | 'all'
  finishType: FinishType | 'all'
  status: PaintStatus | 'all'
}

export const INITIAL_FILTERS: PaintFilters = {
  search: '',
  brand: 'all',
  colorFamily: 'all',
  finishType: 'all',
  status: 'all',
}

const COLOR_FAMILIES: Array<ColorFamily | 'all'> = [
  'all',
  '赤',
  '青',
  '黄',
  '緑',
  '白',
  '黒',
  '銀',
  '金',
  '茶',
  '蛍光',
  'クリア',
  'other',
]

const FINISH_TYPES: Array<FinishType | 'all'> = [
  'all',
  '光沢',
  '半光沢',
  'つや消し',
  'メタリック',
  'パール',
  'クリア',
  'プライマー',
  'ウェザリング',
]

const STATUSES: Array<PaintStatus | 'all'> = ['all', 'new', 'in_use', 'empty']

const STATUS_LABEL: Record<PaintStatus | 'all', string> = {
  all: 'すべて',
  new: '新品',
  in_use: '使用中',
  empty: '空',
}

export interface PaintFilterBarProps {
  filters: PaintFilters
  brands: string[]
  onChange: (next: PaintFilters) => void
}

export function PaintFilterBar({ filters, brands, onChange }: PaintFilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg border border-border bg-card">
      <Input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="名前 / コードで検索"
        className="md:col-span-4"
      />
      <Select
        value={filters.brand}
        onValueChange={(v) => onChange({ ...filters, brand: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="ブランド" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべてのブランド</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.colorFamily}
        onValueChange={(v) =>
          onChange({ ...filters, colorFamily: v as PaintFilters['colorFamily'] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="色系統" />
        </SelectTrigger>
        <SelectContent>
          {COLOR_FAMILIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c === 'all' ? 'すべての色系統' : c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.finishType}
        onValueChange={(v) =>
          onChange({ ...filters, finishType: v as PaintFilters['finishType'] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="フィニッシュ" />
        </SelectTrigger>
        <SelectContent>
          {FINISH_TYPES.map((f) => (
            <SelectItem key={f} value={f}>
              {f === 'all' ? 'すべてのフィニッシュ' : f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ ...filters, status: v as PaintFilters['status'] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="状態" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
