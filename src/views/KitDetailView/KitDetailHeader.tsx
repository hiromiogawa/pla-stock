import type { Kit } from '~/entities/kit'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

export interface KitDetailHeaderProps {
  kit: Kit
  editing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}

export function KitDetailHeader({ kit, editing, onEdit, onCancelEdit, onDelete }: KitDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{kit.name}</h1>
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Badge variant="outline">{kit.grade}</Badge>
          <Badge variant="outline">{kit.scale}</Badge>
          <span>·</span>
          <span>{kit.maker}</span>
          {kit.visibility === 'private' && (
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
