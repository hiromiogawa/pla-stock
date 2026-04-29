import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import type { Kit } from '~/entities/kit'
import type { Paint } from '~/entities/paint'
import type { Project, ProjectPhoto } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'
import { LinkedKit } from './LinkedKit'
import { ProjectDeleteDialog } from './ProjectDeleteDialog'
import { ProjectDetailFields } from './ProjectDetailFields'
import { ProjectEditForm } from './ProjectEditForm'
import { ProjectPaintUses } from './ProjectPaintUses'
import { ProjectPhotos } from './ProjectPhotos'
import type { UseProjectDetailReturn } from './useProjectDetail'

interface ProjectDetailViewProps extends UseProjectDetailReturn {
  project: Project | null
  kit: Kit | null
  paintsForProject: Paint[]
  allPaints: Paint[]
  photos: ProjectPhoto[]
}

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

const STATUS_VARIANT: Record<Project['status'], 'default' | 'secondary' | 'outline'> = {
  planning: 'outline',
  building: 'secondary',
  completed: 'default',
  abandoned: 'outline',
}

export function ProjectDetailView({
  project,
  kit,
  paintsForProject,
  allPaints,
  photos,
  editing,
  showDeleteDialog,
  setEditing,
  setShowDeleteDialog,
  handleSave,
  handleDelete,
  handleAddPaint,
  handleRemovePaint,
  handleAddPhoto,
  handleRemovePhoto,
  handleBackToList,
}: ProjectDetailViewProps) {
  if (!project || !kit) {
    return (
      <Stack
        spacing={2}
        sx={{
          maxWidth: '896px',
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 5, md: 10 },
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          プロジェクトが見つかりません
        </Typography>
        <Box>
          <Button onClick={handleBackToList}>プロジェクト一覧へ戻る</Button>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack
      spacing={3}
      sx={{
        maxWidth: '896px',
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      {/* Navigation tier */}
      <Box>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToList}
          sx={{
            color: 'text.secondary',
            paddingInlineStart: 0.5,
            paddingInlineEnd: 1,
            minWidth: 'unset',
            gap: 0.75,
            '&:hover': { color: 'text.primary' },
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          プロジェクト一覧へ
        </Button>
      </Box>

      {/* Identification + secondary action (edit) */}
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {project.name}
          </Typography>
          <Box>
            <Badge variant={STATUS_VARIANT[project.status]}>{STATUS_LABEL[project.status]}</Badge>
          </Box>
        </Stack>
        {!editing && (
          <IconButton
            size="small"
            aria-label="編集"
            onClick={() => setEditing(true)}
            sx={{ color: 'text.secondary' }}
          >
            <Pencil size={16} strokeWidth={1.75} />
          </IconButton>
        )}
      </Stack>

      {/* プロジェクト情報 (or edit form) */}
      {editing ? (
        <ProjectEditForm project={project} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <ProjectDetailFields project={project} />
      )}

      {/* 使用キット */}
      <LinkedKit kit={kit} />

      {/* 使用塗料 (section action: 追加) */}
      <ProjectPaintUses
        paints={paintsForProject}
        allPaints={allPaints}
        onAdd={handleAddPaint}
        onRemove={handleRemovePaint}
      />

      {/* 写真 (section action: 追加) */}
      <ProjectPhotos photos={photos} onAdd={handleAddPhoto} onRemove={handleRemovePhoto} />

      {/* Tertiary action: Danger Zone */}
      {!editing && (
        <Box
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: 'error.main',
            bgcolor: 'background.paper',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
              プロジェクトを削除
            </Typography>
            <Typography variant="caption" color="text.secondary">
              関連する塗料リンク・写真も cascade 削除されます。元に戻せません。
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="プロジェクトを削除"
            onClick={() => setShowDeleteDialog(true)}
            sx={{ color: 'error.main', flexShrink: 0 }}
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </IconButton>
        </Box>
      )}

      <ProjectDeleteDialog
        open={showDeleteDialog}
        projectName={project.name}
        projectStatus={project.status}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </Stack>
  )
}
