import type { Paint } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

export interface PaintDetailHeaderProps {
  paint: Paint
  editing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}

export function PaintDetailHeader({
  paint,
  editing,
  onEdit,
  onCancelEdit,
  onDelete,
}: PaintDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {paint.brand} {paint.code} {paint.name}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {paint.colorFamily && <Badge variant="outline">{paint.colorFamily}</Badge>}
          {paint.finishType && <Badge variant="outline">{paint.finishType}</Badge>}
          {paint.visibility === 'private' && (
            <Badge variant="outline" className="ml-1">private</Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {editing ? (
          <Button variant="outline" onClick={onCancelEdit}>キャンセル</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onEdit}>編集</Button>
            <Button variant="destructive" onClick={onDelete}>削除</Button>
          </>
        )}
      </div>
    </div>
  )
}
