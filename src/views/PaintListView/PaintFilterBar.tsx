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

/** runtime narrowing: 想定外の値が来たら 'all' に fallback */
function toColorFamily(value: string): PaintFilters['colorFamily'] {
  for (const family of COLOR_FAMILIES) {
    if (family === value) return family
  }
  return 'all'
}

function toFinishType(value: string): PaintFilters['finishType'] {
  for (const finish of FINISH_TYPES) {
    if (finish === value) return finish
  }
  return 'all'
}

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
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        placeholder="名前 / コードで検索"
        className="md:col-span-3"
      />
      <FormControl fullWidth size="small">
        <Select<string>
          value={filters.brand}
          onChange={(event) => onChange({ ...filters, brand: String(event.target.value) })}
        >
          <MenuItem value="all">すべてのブランド</MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand} value={brand}>
              {brand}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select<PaintFilters['colorFamily']>
          value={filters.colorFamily}
          onChange={(event) =>
            onChange({ ...filters, colorFamily: toColorFamily(String(event.target.value)) })
          }
        >
          {COLOR_FAMILIES.map((family) => (
            <MenuItem key={family} value={family}>
              {family === 'all' ? 'すべての色系統' : family}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select<PaintFilters['finishType']>
          value={filters.finishType}
          onChange={(event) =>
            onChange({ ...filters, finishType: toFinishType(String(event.target.value)) })
          }
        >
          {FINISH_TYPES.map((finish) => (
            <MenuItem key={finish} value={finish}>
              {finish === 'all' ? 'すべてのフィニッシュ' : finish}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
