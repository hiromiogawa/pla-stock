import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Search } from 'lucide-react'
import type { ColorFamily, FinishType } from '~/entities/paint'
import { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES } from '~/entities/paint'

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
  const hasActiveFilter =
    filters.search !== '' ||
    filters.brand !== 'all' ||
    filters.colorFamily !== 'all' ||
    filters.finishType !== 'all'

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        fullWidth
        type="search"
        placeholder="名前 / コードで検索"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} strokeWidth={1.75} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
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
        {hasActiveFilter && (
          <Button
            size="small"
            onClick={() => onChange(INITIAL_FILTERS)}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            クリア
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
