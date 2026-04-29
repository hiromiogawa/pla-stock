import { useForm } from '@tanstack/react-form'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { Kit } from '~/entities/kit'
import { projectAddSchema, type ProjectAddInput } from '~/features/project-add'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

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

  return (
    <form
      className="rounded-lg border border-border bg-card p-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div>
        <h2 className="text-sm font-semibold">新規プロジェクト</h2>
        <p className="text-xs text-muted-foreground mt-1">
          作成すると選択したキットの在庫が 1 減り、status は「計画中」で初期化されます。
        </p>
      </div>

      <form.Field name="kitId">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>キット *</Label>
            <FormControl fullWidth size="small">
              <Select
                id={field.name}
                value={field.state.value}
                displayEmpty
                onChange={(e) => field.handleChange(e.target.value as string)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: 'rgba(0,0,0,0.45)' }}>在庫キットから選択</span>
                  }
                  const kit = selectableKits.find((k) => k.id === selected)
                  return kit
                    ? `${kit.name}（${kit.grade} · ${kit.scale}） 在庫: ${stockCountByKitId[kit.id] ?? 0}`
                    : (selected as string)
                }}
              >
                {selectableKits.map((kit) => (
                  <MenuItem key={kit.id} value={kit.id}>
                    {kit.name}（{kit.grade} · {kit.scale}） 在庫: {stockCountByKitId[kit.id] ?? 0}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>名前 *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Sazabi Ver.Ka 塗装計画 など"
              maxLength={200}
              required
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>説明</Label>
            <Textarea
              id={field.name}
              name={field.name}
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              maxLength={2000}
            />
          </div>
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
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !kitId}>
              {isSubmitting ? '作成中…' : '作成'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
