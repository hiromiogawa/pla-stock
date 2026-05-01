import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { Kit } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { ProjectCreateForm } from './ProjectCreateForm'
import type { UseProjectCreateReturn } from './useProjectCreate'

interface ProjectCreateViewProps extends UseProjectCreateReturn {
  /** count > 0 の自分の在庫キットだけ */
  selectableKits: Kit[]
  /** kitId → 在庫数 (selectableKits に対応) */
  stockCountByKitId: Record<string, number>
}

export function ProjectCreateView({
  selectableKits,
  stockCountByKitId,
  handleSubmit,
  handleCancel,
}: ProjectCreateViewProps) {
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
          onClick={handleCancel}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </IconButton>
      </Box>

      {/* Identification */}
      <Stack spacing={1} sx={{ minWidth: 0 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          新規プロジェクトを作成
        </Typography>
        <Typography variant="caption" color="text.secondary">
          在庫キットを 1 つ選んでプロジェクト化します。作成と同時に在庫が 1 減ります。
        </Typography>
      </Stack>

      {/* Body: empty state or form */}
      {selectableKits.length === 0 ? (
        <Stack
          spacing={2}
          sx={{
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            padding: 2,
          }}
        >
          <Typography variant="body2">
            在庫キットがありません。先にキットを追加してください。
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button component={Link} to="/kits/new" size="sm">
              キットを追加
            </Button>
            <Button variant="outline" size="sm" component={Link} to="/projects">
              プロジェクト一覧へ
            </Button>
          </Stack>
        </Stack>
      ) : (
        <ProjectCreateForm
          selectableKits={selectableKits}
          stockCountByKitId={stockCountByKitId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </Stack>
  )
}
