import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeft } from 'lucide-react'
import type { Paint, PaintEvent, PaintStock } from '~/entities/paint'
import type { Project } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { LinkedProjectsForPaint } from './LinkedProjectsForPaint'
import { PaintDetailFields } from './PaintDetailFields'
import { PaintPurchaseDialog } from './PaintPurchaseDialog'
import { PaintReleaseDialog } from './PaintReleaseDialog'
import type { UsePaintDetailReturn } from './usePaintDetail'

interface PaintDetailViewProps extends UsePaintDetailReturn {
  stock: PaintStock | null
  paint: Paint | null
  events: PaintEvent[]
  linkedProjects: Project[]
}

export function PaintDetailView({
  stock,
  paint,
  events,
  linkedProjects,
  showPurchaseDialog,
  showReleaseDialog,
  setShowPurchaseDialog,
  setShowReleaseDialog,
  handlePurchase,
  handleRelease,
  handleBackToList,
}: PaintDetailViewProps) {
  if (!stock || !paint) {
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
          塗料が見つかりません
        </Typography>
        <Typography variant="body2" color="text.secondary">
          指定された paintId の塗料は存在しないか、在庫がありません。
        </Typography>
        <Box>
          <Button onClick={handleBackToList}>塗料一覧へ戻る</Button>
        </Box>
      </Stack>
    )
  }

  const paintLabel = `${paint.brand} ${paint.code} ${paint.name}`

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
      {/* Navigation tier: back to list */}
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
          塗料一覧へ
        </Button>
      </Box>

      {/* Identification */}
      <Stack spacing={1}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          {paint.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {paint.brand} · {paint.code}
        </Typography>
      </Stack>

      <PaintDetailFields
        stock={stock}
        paint={paint}
        events={events}
        onPurchase={() => setShowPurchaseDialog(true)}
        onRelease={() => setShowReleaseDialog(true)}
      />
      <LinkedProjectsForPaint projects={linkedProjects} />
      <PaintPurchaseDialog
        open={showPurchaseDialog}
        paintLabel={paintLabel}
        onOpenChange={setShowPurchaseDialog}
        onConfirm={handlePurchase}
      />
      <PaintReleaseDialog
        open={showReleaseDialog}
        paintLabel={paintLabel}
        onOpenChange={setShowReleaseDialog}
        onConfirm={handleRelease}
      />
    </Stack>
  )
}
