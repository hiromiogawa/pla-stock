import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useForm } from '@tanstack/react-form'
import { Button } from '~/shared/ui/button'
import { FormTextField } from '~/shared/ui/FormTextField'
import { ACCEPTED_IMAGE_TYPES } from '~/shared/lib/image/constants'
import { processImageForUpload } from '~/shared/lib/image/compressImage'

export interface AddPhotoInput {
  file: File
  caption?: string
  takenAt?: string
}

interface AddPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AddPhotoInput) => void | Promise<void>
}

interface AddPhotoFormDefaults {
  file: File | null
  caption: string
  takenAt: string
}

const ADD_PHOTO_FORM_DEFAULTS: AddPhotoFormDefaults = {
  file: null,
  caption: '',
  takenAt: '',
}

export function AddPhotoDialog({ open, onOpenChange, onSubmit }: AddPhotoDialogProps) {
  const [processing, setProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processError, setProcessError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: ADD_PHOTO_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      if (value.file === null) return
      await onSubmit({
        file: value.file,
        caption: value.caption.trim() === '' ? undefined : value.caption.trim(),
        takenAt: value.takenAt === '' ? undefined : value.takenAt,
      })
      form.reset()
      setPreviewUrl(null)
      setProcessError(null)
    },
  })

  // preview objectURL のリーク防止: preview 差し替え時 / unmount 時に revoke
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleClose = () => {
    form.reset()
    setPreviewUrl(null)
    setProcessError(null)
    setProcessing(false)
    onOpenChange(false)
  }

  const handleFileSelected = async (rawFile: File | undefined) => {
    if (!rawFile) return
    setProcessError(null)
    setProcessing(true)
    form.setFieldValue('file', null)
    try {
      const compressed = await processImageForUpload(rawFile)
      setPreviewUrl(URL.createObjectURL(compressed))
      form.setFieldValue('file', compressed)
    } catch (error) {
      setProcessError(error instanceof Error ? error.message : '画像の処理に失敗しました')
      setPreviewUrl(null)
    } finally {
      setProcessing(false)
    }
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
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Button type="button" variant="outline" component="label" disabled={processing}>
                画像を選択
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  hidden
                  onChange={(event) => void handleFileSelected(event.target.files?.[0])}
                />
              </Button>
              {processing && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    圧縮中…
                  </Typography>
                </Stack>
              )}
              {processError && <FormHelperText error>{processError}</FormHelperText>}
            </Box>

            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="プレビュー"
                sx={{
                  width: '100%',
                  maxHeight: 240,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  display: 'block',
                  bgcolor: 'background.default',
                }}
              />
            )}

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
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={processing || previewUrl === null || isSubmitting}>
                {isSubmitting ? <CircularProgress size={16} /> : '追加'}
              </Button>
            )}
          </form.Subscribe>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
