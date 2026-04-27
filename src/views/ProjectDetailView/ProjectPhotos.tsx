import { useState } from 'react'
import type { ProjectPhoto } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { AddPhotoDialog, type AddPhotoInput } from './AddPhotoDialog'

export interface ProjectPhotosProps {
  photos: ProjectPhoto[]
  onAdd: (input: AddPhotoInput) => void | Promise<void>
  onRemove: (photoId: string) => void | Promise<void>
}

export function ProjectPhotos({ photos, onAdd, onRemove }: ProjectPhotosProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">写真</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          + 写真を追加
        </Button>
      </div>
      {photos.length === 0 ? (
        <p className="text-xs text-muted-foreground">まだ写真がありません</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt={photo.caption ?? ''}
                className="w-full aspect-square object-cover rounded-md border border-border"
              />
              {photo.caption && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
              )}
              <button
                type="button"
                onClick={() => void onRemove(photo.id)}
                className="absolute top-1 right-1 text-xs bg-destructive text-destructive-foreground rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
      <AddPhotoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await onAdd(input)
          setShowAddDialog(false)
        }}
      />
    </section>
  )
}
