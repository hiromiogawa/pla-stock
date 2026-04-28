import type { ColorFamily, FinishType } from '~/entities/paint'
import { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES } from '~/entities/paint'
import { Input } from '~/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/shared/ui/select'

export interface PaintFilters {
  search: string
  brand: string | 'all'
  colorFamily: ColorFamily | 'all'
  finishType: FinishType | 'all'
}

export const INITIAL_FILTERS: PaintFilters = {
  search: '',
  brand: 'all',
  colorFamily: 'all',
  finishType: 'all',
}

const COLOR_FAMILIES: Array<ColorFamily | 'all'> = ['all', ...COLOR_FAMILY_VALUES]
const FINISH_TYPES: Array<FinishType | 'all'> = ['all', ...FINISH_TYPE_VALUES]

interface PaintFilterBarProps {
  filters: PaintFilters
  brands: string[]
  onChange: (next: PaintFilters) => void
}

export function PaintFilterBar({ filters, brands, onChange }: PaintFilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card">
      <Input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="名前 / コードで検索"
        className="md:col-span-3"
      />
      <Select value={filters.brand} onValueChange={(v) => onChange({ ...filters, brand: v })}>
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
        onValueChange={(v) => onChange({ ...filters, finishType: v as PaintFilters['finishType'] })}
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
    </div>
  )
}
