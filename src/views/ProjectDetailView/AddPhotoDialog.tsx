import { useState } from 'react'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'

export interface AddPhotoInput {
  url: string
  caption?: string
  takenAt?: string
}

export interface AddPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AddPhotoInput) => void | Promise<void>
}

export function AddPhotoDialog({ open, onOpenChange, onSubmit }: AddPhotoDialogProps) {
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [takenAt, setTakenAt] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>写真を追加</DialogTitle>
          <DialogDescription>
            Phase A-2 は URL 文字列を直接入力する mock 実装です。Phase D で R2 アップロードに置換予定。
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (url.trim() === '') return
            void onSubmit({
              url: url.trim(),
              caption: caption.trim() || undefined,
              takenAt: takenAt || undefined,
            })
            setUrl('')
            setCaption('')
            setTakenAt('')
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="photo-url">画像 URL *</Label>
            <Input
              id="photo-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo-caption">キャプション</Label>
            <Input
              id="photo-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo-takenAt">撮影日</Label>
            <Input
              id="photo-takenAt"
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
