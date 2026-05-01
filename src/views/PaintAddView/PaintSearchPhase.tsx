import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Paint } from '~/entities/paint'
import { PaintMasterCandidate } from './PaintMasterCandidate'

interface PaintSearchPhaseProps {
  paints: Paint[]
  onSelectMaster: (paint: Paint) => void
}

export function PaintSearchPhase({ paints, onSelectMaster }: PaintSearchPhaseProps) {
  const [query, setQuery] = useState('')

  const candidates = useMemo<Paint[]>(() => {
    const normalized = query.trim().toLowerCase()
    if (normalized === '') return []
    return paints
      .filter((paint) => {
        return (
          paint.name.toLowerCase().includes(normalized) ||
          paint.code.toLowerCase().includes(normalized) ||
          paint.brand.toLowerCase().includes(normalized)
        )
      })
      .slice(0, 30)
  }, [paints, query])

  return (
    <Stack spacing={2}>
      <TextField
        type="search"
        size="small"
        fullWidth
        autoFocus
        placeholder="ブランド / コード / 名前で検索 (例: Mr.Color, C1, ホワイト)"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
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
      <SearchResults query={query} candidates={candidates} onSelectMaster={onSelectMaster} />
    </Stack>
  )
}

interface SearchResultsProps {
  query: string
  candidates: Paint[]
  onSelectMaster: (paint: Paint) => void
}

function SearchResults({ query, candidates, onSelectMaster }: SearchResultsProps) {
  if (query.trim() === '') {
    return (
      <Typography variant="caption" color="text.secondary">
        キーワードを入力してマスターから検索してください。
      </Typography>
    )
  }
  if (candidates.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        「{query}」に一致する塗料が見つかりませんでした。マスターに無い塗料は admin
        に申請してください (Phase E 以降の機能)。
      </Typography>
    )
  }
  return (
    <Stack spacing={1}>
      {candidates.map((paint) => (
        <PaintMasterCandidate key={paint.id} paint={paint} onSelect={() => onSelectMaster(paint)} />
      ))}
    </Stack>
  )
}
