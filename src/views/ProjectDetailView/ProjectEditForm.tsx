import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useForm } from '@tanstack/react-form'
import { PROJECT_STATUS_LABEL, type Project, type ProjectStatus } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { FormSelect, type FormSelectOption } from '~/shared/ui/FormSelect'
import { FormTextField } from '~/shared/ui/FormTextField'

export interface ProjectEditValues {
  name: string
  description: string | null
  status: ProjectStatus
  startedAt: string | null
  completedAt: string | null
}

interface ProjectEditFormProps {
  project: Project
  onSave: (values: ProjectEditValues) => void | Promise<void>
  onCancel: () => void
}

const STATUS_ORDER: ProjectStatus[] = ['planning', 'building', 'completed', 'abandoned']

const STATUS_OPTIONS: FormSelectOption[] = STATUS_ORDER.map((status) => ({
  value: status,
  label: PROJECT_STATUS_LABEL[status],
}))

export function ProjectEditForm({ project, onSave, onCancel }: ProjectEditFormProps) {
  const form = useForm({
    defaultValues: {
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      startedAt: project.startedAt ?? '',
      completedAt: project.completedAt ?? '',
    },
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim()
      if (!trimmedName) return
      const values: ProjectEditValues = {
        name: trimmedName,
        description: value.description.trim() || null,
        status: value.status,
        startedAt: value.startedAt || null,
        completedAt: value.completedAt || null,
      }
      // status 遷移時の自動セット
      if (project.status === 'planning' && values.status === 'building' && !values.startedAt) {
        values.startedAt = new Date().toISOString().slice(0, 10)
      }
      if (project.status !== 'completed' && values.status === 'completed' && !values.completedAt) {
        values.completedAt = new Date().toISOString().slice(0, 10)
      }
      await onSave(values)
    },
  })

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
      <Stack spacing={3}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          プロジェクトを編集
        </Typography>

        <form.Field name="name">
          {(field) => <FormTextField field={field} label="名前 *" required />}
        </form.Field>

        <form.Field name="description">
          {(field) => <FormTextField field={field} label="説明" multiline rows={3} />}
        </form.Field>

        <form.Field name="status">
          {(field) => <FormSelect field={field} label="ステータス" options={STATUS_OPTIONS} />}
        </form.Field>

        <form.Field name="startedAt">
          {(field) => (
            <FormTextField
              field={field}
              label="開始日"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        </form.Field>

        <form.Field name="completedAt">
          {(field) => (
            <FormTextField
              field={field}
              label="完成日"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            name: state.values.name,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ name, isSubmitting }) => (
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? '保存中…' : '保存'}
              </Button>
            </Stack>
          )}
        </form.Subscribe>
      </Stack>
    </Box>
  )
}
