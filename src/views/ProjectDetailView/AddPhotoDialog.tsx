import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormLabel from '@mui/material/FormLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import { Button } from '~/shared/ui/button'

export interface AddPhotoInput {
  url: string
  caption?: string
  takenAt?: string
}

interface AddPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AddPhotoInput) => void | Promise<void>
}

export function AddPhotoDialog({ open, onOpenChange, onSubmit }: AddPhotoDialogProps) {
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [takenAt, setTakenAt] = useState('')

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>写真を追加</DialogTitle>
      <form
        onSubmit={(event) => {
          event.preventDefault()
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
        <DialogContent>
          <DialogContentText>
            Phase A-2 は URL 文字列を直接入力する mock 実装です。Phase D で R2
            アップロードに置換予定。
          </DialogContentText>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <FormLabel htmlFor="photo-url">画像 URL *</FormLabel>
              <OutlinedInput
                id="photo-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                required
                size="small"
                fullWidth
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="photo-caption">キャプション</FormLabel>
              <OutlinedInput
                id="photo-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                size="small"
                fullWidth
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="photo-takenAt">撮影日</FormLabel>
              <OutlinedInput
                id="photo-takenAt"
                type="date"
                value={takenAt}
                onChange={(event) => setTakenAt(event.target.value)}
                size="small"
                fullWidth
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button type="submit">追加</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
