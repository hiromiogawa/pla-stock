import type { Kit } from '~/entities/kit'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

interface KitMasterCandidateProps {
  kit: Kit
  onSelect: () => void
}

export function KitMasterCandidate({ kit, onSelect }: KitMasterCandidateProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{kit.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs">
            {kit.grade}
          </Badge>
          <span>·</span>
          <span>{kit.scale}</span>
        </div>
      </div>
      <Button onClick={onSelect}>在庫に追加</Button>
    </div>
  )
}
