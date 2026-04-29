import { useState } from 'react'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { Project, ProjectStatus } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

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

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: '計画中' },
  { value: 'building', label: '製作中' },
  { value: 'completed', label: '完成' },
  { value: 'abandoned', label: '頓挫' },
]

export function ProjectEditForm({ project, onSave, onCancel }: ProjectEditFormProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [startedAt, setStartedAt] = useState(project.startedAt ?? '')
  const [completedAt, setCompletedAt] = useState(project.completedAt ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const values: ProjectEditValues = {
        name: name.trim(),
        description: description.trim() || null,
        status,
        startedAt: startedAt || null,
        completedAt: completedAt || null,
      }
      // status 遷移時の自動セット
      if (project.status === 'planning' && values.status === 'building' && !values.startedAt) {
        values.startedAt = new Date().toISOString().slice(0, 10)
      }
      if (project.status !== 'completed' && values.status === 'completed' && !values.completedAt) {
        values.completedAt = new Date().toISOString().slice(0, 10)
      }
      await onSave(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
      <h2 className="text-sm font-semibold">プロジェクトを編集</h2>
      <div className="space-y-2">
        <Label htmlFor="edit-name">名前 *</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">説明</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-status">ステータス</Label>
        <FormControl fullWidth size="small">
          <Select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-startedAt">開始日</Label>
        <Input
          id="edit-startedAt"
          type="date"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-completedAt">完成日</Label>
        <Input
          id="edit-completedAt"
          type="date"
          value={completedAt}
          onChange={(e) => setCompletedAt(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          キャンセル
        </Button>
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? '保存中…' : '保存'}
        </Button>
      </div>
    </form>
  )
}
