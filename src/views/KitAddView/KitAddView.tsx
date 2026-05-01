import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeft } from 'lucide-react'
import type { Kit } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { KitSearchPhase } from './KitSearchPhase'
import { KitStockForm } from './KitStockForm'
import type { UseKitAddReturn } from './useKitAdd'

interface KitAddViewProps extends UseKitAddReturn {
  kits: Kit[]
}

export function KitAddView({
  kits,
  phase,
  goToSearch,
  selectKit,
  handleStockSubmit,
  handleBackToList,
}: KitAddViewProps) {
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
          aria-label="キット一覧へ戻る"
          title="キット一覧へ戻る"
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
            キットを在庫に追加
          </Typography>
          <Typography variant="caption" color="text.secondary">
            マスターから検索してキットの購入記録を追加できます。
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
      {phase.kind === 'search' && <KitSearchPhase kits={kits} onSelectMaster={selectKit} />}

      {phase.kind === 'add-stock' && (
        <KitStockForm
          kit={phase.kit}
          onSubmit={(values) => handleStockSubmit(phase.kit.id, values)}
          onCancel={goToSearch}
        />
      )}
    </Stack>
  )
}
