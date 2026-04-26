import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Kit, KitStock } from '~/entities/kit'
import type { Project } from '~/entities/project'
import { deleteKitStock, updateKitStock } from '~/shared/api/mock/kits'
import { getMockSession } from '~/shared/lib/mock-auth'
import { Button } from '~/shared/ui/button'
import { KitDetailHeader } from './KitDetailHeader'
import { KitDetailFields } from './KitDetailFields'
import { KitEditForm, type KitEditValues } from './KitEditForm'
import { KitDeleteDialog } from './KitDeleteDialog'
import { LinkedProjects } from './LinkedProjects'

export interface KitDetailViewProps {
  stock: KitStock | null
  kit: Kit | null
  linkedProjects: Project[]
}

export function KitDetailView({ stock, kit, linkedProjects }: KitDetailViewProps) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentStock, setCurrentStock] = useState(stock)

  if (!currentStock || !kit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">キットが見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          指定された stockId のキットは存在しないか、削除済みです。
        </p>
        <Button onClick={() => navigate({ to: '/app/kits' })}>キット一覧へ戻る</Button>
      </div>
    )
  }

  const handleSave = async (values: KitEditValues) => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const updated = await updateKitStock({
      stockId: currentStock.id,
      userId,
      patch: values,
    })
    if (updated) {
      setCurrentStock(updated)
      setEditing(false)
    }
  }

  const handleDelete = async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const ok = await deleteKitStock({ stockId: currentStock.id, userId })
    if (ok) {
      void navigate({ to: '/app/kits' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <KitDetailHeader
        kit={kit}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      {editing ? (
        <KitEditForm
          stock={currentStock}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <KitDetailFields stock={currentStock} kit={kit} />
      )}
      <LinkedProjects projects={linkedProjects} />
      <KitDeleteDialog
        open={showDeleteDialog}
        kitName={kit.name}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
}
