import type { Paint } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

export interface PaintMasterCandidateProps {
  paint: Paint
  onSelect: () => void
}

export function PaintMasterCandidate({ paint, onSelect }: PaintMasterCandidateProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">
          {paint.brand} {paint.code} {paint.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
          {paint.colorFamily && (
            <Badge variant="outline" className="text-xs">
              {paint.colorFamily}
            </Badge>
          )}
          {paint.finishType && (
            <Badge variant="outline" className="text-xs">
              {paint.finishType}
            </Badge>
          )}
          {paint.visibility === 'private' && (
            <Badge variant="outline" className="ml-1 text-xs">
              private
            </Badge>
          )}
        </div>
      </div>
      <Button onClick={onSelect}>在庫に追加</Button>
    </div>
  )
}
