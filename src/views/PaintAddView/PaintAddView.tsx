import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeft } from 'lucide-react'
import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { PaintSearchPhase } from './PaintSearchPhase'
import { PaintStockForm } from './PaintStockForm'
import type { UsePaintAddReturn } from './usePaintAdd'

interface PaintAddViewProps extends UsePaintAddReturn {
  paints: Paint[]
}

export function PaintAddView({
  paints,
  phase,
  goToSearch,
  selectPaint,
  handleStockSubmit,
  handleBackToList,
}: PaintAddViewProps) {
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
          aria-label="塗料一覧へ戻る"
          title="塗料一覧へ戻る"
          onClick={handleBackToList}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </IconButton>
      </Box>

      {/* Identification + secondary action (wizard form phase only) */}
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            塗料を在庫に追加
          </Typography>
          <Typography variant="caption" color="text.secondary">
            マスターから検索して塗料の購入記録を追加できます。
          </Typography>
        </Stack>
        {phase.kind !== 'search' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToSearch}
            sx={{ gap: 0.75, color: 'text.secondary', flexShrink: 0 }}
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            検索に戻る
          </Button>
        )}
      </Stack>

      {/* Phase body */}
      {phase.kind === 'search' && <PaintSearchPhase paints={paints} onSelectMaster={selectPaint} />}

      {phase.kind === 'add-stock' && (
        <PaintStockForm
          paint={phase.paint}
          onSubmit={(values) => handleStockSubmit(phase.paint.id, values)}
          onCancel={goToSearch}
        />
      )}
    </Stack>
  )
}
