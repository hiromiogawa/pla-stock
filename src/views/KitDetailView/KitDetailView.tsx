import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeft } from 'lucide-react'
import type { Kit, KitEvent, KitStock } from '~/entities/kit'
import type { Project } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { KitDetailFields } from './KitDetailFields'
import { KitPurchaseDialog } from './KitPurchaseDialog'
import { KitReleaseDialog } from './KitReleaseDialog'
import { LinkedProjects } from './LinkedProjects'
import type { UseKitDetailReturn } from './useKitDetail'

interface KitDetailViewProps extends UseKitDetailReturn {
  stock: KitStock | null
  kit: Kit | null
  events: KitEvent[]
  linkedProjects: Project[]
}

export function KitDetailView({
  stock,
  kit,
  events,
  linkedProjects,
  showPurchaseDialog,
  showReleaseDialog,
  setShowPurchaseDialog,
  setShowReleaseDialog,
  handlePurchase,
  handleRelease,
  handleBackToList,
}: KitDetailViewProps) {
  if (!stock || !kit) {
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
          キットが見つかりません
        </Typography>
        <Typography variant="body2" color="text.secondary">
          指定された kitId のキットは存在しないか、在庫がありません。
        </Typography>
        <Box>
          <Button onClick={handleBackToList}>キット一覧へ戻る</Button>
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
          キット一覧へ
        </Button>
      </Box>

      {/* Identification */}
      <Stack spacing={1}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          {kit.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {kit.grade} · {kit.scale}
        </Typography>
      </Stack>

      <KitDetailFields
        stock={stock}
        kit={kit}
        events={events}
        onPurchase={() => setShowPurchaseDialog(true)}
        onRelease={() => setShowReleaseDialog(true)}
      />
      <LinkedProjects projects={linkedProjects} />
      <KitPurchaseDialog
        open={showPurchaseDialog}
        kitName={kit.name}
        onOpenChange={setShowPurchaseDialog}
        onConfirm={handlePurchase}
      />
      <KitReleaseDialog
        open={showReleaseDialog}
        kitName={kit.name}
        onOpenChange={setShowReleaseDialog}
        onConfirm={handleRelease}
      />
    </Stack>
  )
}
