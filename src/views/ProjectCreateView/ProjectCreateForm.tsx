import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useForm } from '@tanstack/react-form'
import type { Kit } from '~/entities/kit'
import { projectAddSchema, type ProjectAddInput } from '~/features/project-add'
import { Button } from '~/shared/ui/button'
import { FormSelect, type FormSelectOption } from '~/shared/ui/FormSelect'
import { FormTextField } from '~/shared/ui/FormTextField'

interface ProjectCreateFormProps {
  /** count > 0 の自分の在庫キットだけを渡す (空配列なら view 側で empty state を出す前提) */
  selectableKits: Kit[]
  /** kitId → 在庫数 (UI 表示用) */
  stockCountByKitId: Record<string, number>
  onSubmit: (values: ProjectAddInput) => void | Promise<void>
  onCancel: () => void
}

export function ProjectCreateForm({
  selectableKits,
  stockCountByKitId,
  onSubmit,
  onCancel,
}: ProjectCreateFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      kitId: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = projectAddSchema.parse({
        name: value.name,
        description: value.description === '' ? null : value.description,
        kitId: value.kitId,
      })
      await onSubmit(parsed)
    },
  })

  const kitOptions: FormSelectOption[] = selectableKits.map((kit) => ({
    value: kit.id,
    label: `${kit.name} (${kit.grade} · ${kit.scale}) — 在庫: ${stockCountByKitId[kit.id] ?? 0}`,
  }))

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        padding: 2,
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            新規プロジェクト
          </Typography>
          <Typography variant="caption" color="text.secondary">
            作成すると選択したキットの在庫が 1 減り、status は「計画中」で初期化されます。
          </Typography>
        </Stack>

        <form.Field name="kitId">
          {(field) => <FormSelect field={field} label="キット *" options={kitOptions} />}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <FormTextField
              field={field}
              label="名前 *"
              placeholder="Sazabi Ver.Ka 塗装計画 など"
              inputProps={{ maxLength: 200 }}
              required
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormTextField
              field={field}
              label="説明"
              multiline
              rows={3}
              inputProps={{ maxLength: 2000 }}
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            name: state.values.name,
            kitId: state.values.kitId,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ name, kitId, isSubmitting }) => (
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim() || !kitId}>
                {isSubmitting ? '作成中…' : '作成'}
              </Button>
            </Stack>
          )}
        </form.Subscribe>
      </Stack>
    </Box>
  )
}
