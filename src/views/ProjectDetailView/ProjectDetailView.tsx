import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import type { Kit } from '~/entities/kit'
import type { Paint } from '~/entities/paint'
import { PROJECT_STATUS_LABEL, type Project, type ProjectPhoto } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'
import { ProjectDeleteDialog } from './ProjectDeleteDialog'
import { ProjectDetailFields } from './ProjectDetailFields'
import { ProjectEditForm } from './ProjectEditForm'
import { ProjectPaintUses } from './ProjectPaintUses'
import { ProjectPhotos } from './ProjectPhotos'
import type { UseProjectDetailReturn } from './useProjectDetail'

/**
 * ProjectDetail loader の部分失敗エラー (#167)。
 *
 * route loader (`src/routes/_auth/projects/$id.tsx`) の `ProjectDetailLoadErrors`
 * と同型 (key 不在 = 成功、value = user 向けエラーメッセージ)。loader 側の型を
 * import しない理由: routes/ → views/ は FSD 上 NG、view は loader 形状を自分で持つ。
 */
interface PartialLoadErrors {
  kit?: string
  paintUses?: string
  photos?: string
  allPaints?: string
}

interface ProjectDetailViewProps extends UseProjectDetailReturn {
  project: Project | null
  kit: Kit | null
  paintsForProject: Paint[]
  allPaints: Paint[]
  photos: ProjectPhoto[]
  errors: PartialLoadErrors
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
  errors,
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
  // NOTE (#167): kit === null は (a) kit 削除済 (kit_id が orphan) (b) loader で kit 取得失敗
  // (= errors.kit 在) の両方を含む。後者の場合も本 not-found 画面に fall through するため
  // warning Alert は表示されない (KitDetail / PaintDetail と同仕様)。
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
      {/* Navigation tier (icon only、tooltip で意味補完) */}
      <Box>
        <IconButton
          size="small"
          aria-label="プロジェクト一覧へ戻る"
          title="プロジェクト一覧へ戻る"
          onClick={handleBackToList}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </IconButton>
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
            <Badge variant={STATUS_VARIANT[project.status]}>
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
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

      {/* 部分失敗の warning (#167)。loader の任意 query が rejected したとき
          1 ヶ所にまとめて表示。各セクション本体は通常通り render (空配列等の fallback で)。 */}
      {hasPartialErrors(errors) && (
        <Alert severity="warning" variant="outlined">
          <AlertTitle>一部データの取得に失敗しました</AlertTitle>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {errors.paintUses && (
              <Typography variant="body2">使用塗料: {errors.paintUses}</Typography>
            )}
            {errors.allPaints && (
              <Typography variant="body2">塗料 master: {errors.allPaints}</Typography>
            )}
            {errors.photos && <Typography variant="body2">写真: {errors.photos}</Typography>}
            {errors.kit && <Typography variant="body2">紐付きキット: {errors.kit}</Typography>}
          </Stack>
        </Alert>
      )}

      {/* プロジェクト情報 (or edit form) — kit info も同居 */}
      {editing ? (
        <ProjectEditForm project={project} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <ProjectDetailFields project={project} kit={kit} />
      )}

      {/* 使用塗料 (section action: 追加) */}
      <ProjectPaintUses
        paints={paintsForProject}
        allPaints={allPaints}
        onAdd={handleAddPaint}
        onRemove={handleRemovePaint}
      />

      {/* 写真 (section action: 追加) */}
      <ProjectPhotos photos={photos} onAdd={handleAddPhoto} onRemove={handleRemovePhoto} />

      {/* Tertiary action: 控えめな削除リンク (Refined Minimalism = Danger Zone は重くしない) */}
      {!editing && (
        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            sx={{
              color: 'error.main',
              gap: 0.75,
              minWidth: 'unset',
              paddingInline: 1,
              '&:hover': { color: 'error.dark', backgroundColor: 'action.hover' },
            }}
          >
            <Trash2 size={14} strokeWidth={1.75} />
            プロジェクトを削除
          </Button>
        </Stack>
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

function hasPartialErrors(errors: PartialLoadErrors): boolean {
  return Boolean(errors.kit || errors.paintUses || errors.photos || errors.allPaints)
}
