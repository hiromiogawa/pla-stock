import Box from '@mui/material/Box'
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
import { extractFieldErrorMessage } from '~/shared/lib/form-error'
import { MAX_PHOTO_BYTES } from '~/features/project-photo-add'

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

/** File を選んでいない / 画像でない / 空 / 10MB 超 のときエラー文言を返す。 */
function validatePhotoFile(file: File | null): string | undefined {
  if (!file) return '画像ファイルを選択してください'
  if (!file.type.startsWith('image/')) return '画像ファイルを選択してください'
  if (file.size === 0) return '空のファイルです'
  if (file.size > MAX_PHOTO_BYTES) return 'ファイルサイズは 10MB までです'
  return undefined
}

export function AddPhotoDialog({ open, onOpenChange, onSubmit }: AddPhotoDialogProps) {
  const form = useForm({
    defaultValues: ADD_PHOTO_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      if (value.file === null || validatePhotoFile(value.file) !== undefined) return
      await onSubmit({
        file: value.file,
        caption: value.caption.trim() === '' ? undefined : value.caption.trim(),
        takenAt: value.takenAt === '' ? undefined : value.takenAt,
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
          <Stack spacing={2} sx={{ pt: 1 }}>
            <form.Field
              name="file"
              validators={{
                onChange: ({ value }) => validatePhotoFile(value),
                onSubmit: ({ value }) => validatePhotoFile(value),
              }}
            >
              {(field) => {
                const errorText =
                  field.state.meta.errors.length > 0
                    ? extractFieldErrorMessage(field.state.meta.errors[0])
                    : undefined
                return (
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button type="button" variant="outline" component="label">
                        画像を選択
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(event) => field.handleChange(event.target.files?.[0] ?? null)}
                        />
                      </Button>
                      {field.state.value && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {field.state.value.name}
                        </Typography>
                      )}
                    </Stack>
                    {errorText && <FormHelperText error>{errorText}</FormHelperText>}
                  </Box>
                )
              }}
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
