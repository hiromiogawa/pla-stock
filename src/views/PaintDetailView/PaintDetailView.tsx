import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'
import type { Project } from '~/entities/project'
import { deletePaintStock, updatePaintStock } from '~/shared/api/mock/paints'
import { getMockSession } from '~/shared/lib/mock-auth'
import { Button } from '~/shared/ui/button'
import { PaintDetailHeader } from './PaintDetailHeader'
import { PaintDetailFields } from './PaintDetailFields'
import { PaintEditForm, type PaintEditValues } from './PaintEditForm'
import { PaintDeleteDialog } from './PaintDeleteDialog'
import { LinkedProjectsForPaint } from './LinkedProjectsForPaint'

export interface PaintDetailViewProps {
  stock: PaintStock | null
  paint: Paint | null
  linkedProjects: Project[]
}

export function PaintDetailView({ stock, paint, linkedProjects }: PaintDetailViewProps) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentStock, setCurrentStock] = useState(stock)

  if (!currentStock || !paint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">塗料が見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          指定された stockId の塗料は存在しないか、削除済みです。
        </p>
        <Button onClick={() => navigate({ to: '/app/paints' })}>塗料一覧へ戻る</Button>
      </div>
    )
  }

  const handleSave = async (values: PaintEditValues) => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const updated = await updatePaintStock({
      stockId: currentStock.id,
      userId,
      patch: values,
    })
    if (updated) {
      setCurrentStock(updated)
      setEditing(false)
    } else {
      // TODO(Phase-C): toast / error UI に差し替え
      console.warn('updatePaintStock returned null', { stockId: currentStock.id })
    }
  }

  const handleDelete = async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const ok = await deletePaintStock({ stockId: currentStock.id, userId })
    if (ok) {
      void navigate({ to: '/app/paints' })
    } else {
      // TODO(Phase-C): toast / error UI に差し替え
      console.warn('deletePaintStock returned false', { stockId: currentStock.id })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <PaintDetailHeader
        paint={paint}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      {editing ? (
        <PaintEditForm
          stock={currentStock}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <PaintDetailFields stock={currentStock} paint={paint} />
      )}
      <LinkedProjectsForPaint projects={linkedProjects} />
      <PaintDeleteDialog
        open={showDeleteDialog}
        paintLabel={`${paint.brand} ${paint.code} ${paint.name}`}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
}
