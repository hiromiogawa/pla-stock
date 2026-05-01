import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '~/shared/ui/button'
import { FormTextField } from '~/shared/ui/FormTextField'

const photoAddSchema = z.object({
  url: z.string().trim().min(1, '画像 URL は必須です'),
  caption: z.string().max(200).optional().nullable(),
  takenAt: z.string().optional().nullable(),
})

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

interface AddPhotoFormDefaults {
  url: string
  caption: string
  takenAt: string
}

const ADD_PHOTO_FORM_DEFAULTS: AddPhotoFormDefaults = {
  url: '',
  caption: '',
  takenAt: '',
}

export function AddPhotoDialog({ open, onOpenChange, onSubmit }: AddPhotoDialogProps) {
  const form = useForm({
    defaultValues: ADD_PHOTO_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      const parsed = photoAddSchema.parse({
        url: value.url,
        caption: value.caption.trim() === '' ? null : value.caption.trim(),
        takenAt: value.takenAt === '' ? null : value.takenAt,
      })
      await onSubmit({
        url: parsed.url,
        caption: parsed.caption ?? undefined,
        takenAt: parsed.takenAt ?? undefined,
      })
      form.reset()
    },
  })

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>写真を追加</DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <DialogContent>
          <DialogContentText>
            Phase A-2 は URL 文字列を直接入力する mock 実装です。Phase D で R2
            アップロードに置換予定。
          </DialogContentText>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <form.Field
              name="url"
              validators={{
                onChange: ({ value }) => (value.trim() === '' ? '画像 URL は必須です' : undefined),
              }}
            >
              {(field) => (
                <FormTextField field={field} label="画像 URL" placeholder="https://..." required />
              )}
            </form.Field>
            <form.Field name="caption">
              {(field) => <FormTextField field={field} label="キャプション" />}
            </form.Field>
            <form.Field name="takenAt">
              {(field) => <FormTextField field={field} label="撮影日" type="date" />}
            </form.Field>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button type="submit">追加</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
