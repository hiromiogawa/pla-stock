import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Kit } from '~/entities/kit'
import { KitMasterCandidate } from './KitMasterCandidate'

interface KitSearchPhaseProps {
  kits: Kit[]
  onSelectMaster: (kit: Kit) => void
}

export function KitSearchPhase({ kits, onSelectMaster }: KitSearchPhaseProps) {
  const [query, setQuery] = useState('')

  const candidates = useMemo<Kit[]>(() => {
    const normalized = query.trim().toLowerCase()
    if (normalized === '') return []
    return kits.filter((kit) => kit.name.toLowerCase().includes(normalized)).slice(0, 20)
  }, [kits, query])

  return (
    <Stack spacing={2}>
      <TextField
        type="search"
        size="small"
        fullWidth
        autoFocus
        placeholder="キット名で検索 (例: RX-78-2, Sazabi)"
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
  candidates: Kit[]
  onSelectMaster: (kit: Kit) => void
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
        「{query}」に一致するキットが見つかりませんでした。マスターに無いキットは admin
        に申請してください (Phase E 以降の機能)。
      </Typography>
    )
  }
  return (
    <Stack spacing={1}>
      {candidates.map((kit) => (
        <KitMasterCandidate key={kit.id} kit={kit} onSelect={() => onSelectMaster(kit)} />
      ))}
    </Stack>
  )
}
