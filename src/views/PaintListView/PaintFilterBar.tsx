import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { ColorFamily, FinishType } from '~/entities/paint'
import { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES } from '~/entities/paint'
import { Input } from '~/shared/ui/input'

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
      <FormControl fullWidth size="small">
        <Select
          value={filters.brand}
          onChange={(e) => onChange({ ...filters, brand: e.target.value as string })}
        >
          <MenuItem value="all">すべてのブランド</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select
          value={filters.colorFamily}
          onChange={(e) =>
            onChange({ ...filters, colorFamily: e.target.value as PaintFilters['colorFamily'] })
          }
        >
          {COLOR_FAMILIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c === 'all' ? 'すべての色系統' : c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select
          value={filters.finishType}
          onChange={(e) =>
            onChange({ ...filters, finishType: e.target.value as PaintFilters['finishType'] })
          }
        >
          {FINISH_TYPES.map((f) => (
            <MenuItem key={f} value={f}>
              {f === 'all' ? 'すべてのフィニッシュ' : f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
