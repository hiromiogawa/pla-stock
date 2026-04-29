import { useMemo, useState } from 'react'
import type { Paint } from '~/entities/paint'
import { Input } from '~/shared/ui/input'
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

  function renderResults() {
    if (query.trim() === '') {
      return (
        <p className="text-sm text-muted-foreground">
          キーワードを入力してマスターから検索してください。
        </p>
      )
    }
    if (candidates.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          「{query}」に一致する塗料が見つかりませんでした。マスターに無い塗料は admin
          に申請してください (Phase E 以降の機能)。
        </p>
      )
    }
    return (
      <ul className="space-y-2">
        {candidates.map((paint) => (
          <li key={paint.id}>
            <PaintMasterCandidate paint={paint} onSelect={() => onSelectMaster(paint)} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ブランド / コード / 名前で検索 (例: Mr.Color, C1, ホワイト)"
          autoFocus
        />
        {renderResults()}
      </div>
    </div>
  )
}
