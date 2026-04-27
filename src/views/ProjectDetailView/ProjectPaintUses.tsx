import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { Badge } from '~/shared/ui/badge'
import { AddPaintDialog } from './AddPaintDialog'

export interface ProjectPaintUsesProps {
  paints: Paint[]
  allPaints: Paint[]
  onAdd: (paintId: string) => void | Promise<void>
  onRemove: (paintId: string) => void | Promise<void>
}

export function ProjectPaintUses({ paints, allPaints, onAdd, onRemove }: ProjectPaintUsesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  // すでに紐付いてる paintId を除いた候補
  const candidates = allPaints.filter((p) => !paints.some((c) => c.id === p.id))

  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">使用塗料</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          + 塗料を追加
        </Button>
      </div>
      {paints.length === 0 ? (
        <p className="text-xs text-muted-foreground">まだ塗料が追加されていません</p>
      ) : (
        <ul className="space-y-2">
          {paints.map((paint) => (
            <li
              key={paint.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to="/paints/$paintId"
                  params={{ paintId: paint.id }}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {paint.brand} {paint.code} {paint.name}
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5 flex gap-1.5 items-center">
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
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => void onRemove(paint.id)}>
                外す
              </Button>
            </li>
          ))}
        </ul>
      )}
      <AddPaintDialog
        open={showAddDialog}
        candidates={candidates}
        onOpenChange={setShowAddDialog}
        onSelect={async (paintId) => {
          await onAdd(paintId)
          setShowAddDialog(false)
        }}
      />
    </section>
  )
}
