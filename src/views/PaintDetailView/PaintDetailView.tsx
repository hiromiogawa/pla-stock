import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
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

/**
 * PaintDetail loader の部分失敗エラー (#167)。
 *
 * route loader (`src/routes/_auth/paints/$paintId.tsx`) の `PaintDetailLoadErrors`
 * と同型 (key 不在 = 成功、value = user 向けエラーメッセージ)。loader 側の型を
 * import しない理由: routes/ → views/ は FSD 上 NG、view は loader 形状を自分で持つ。
 */
interface PartialLoadErrors {
  stock?: string
  events?: string
  projects?: string
}

interface PaintDetailViewProps extends UsePaintDetailReturn {
  stock: PaintStock | null
  paint: Paint | null
  events: PaintEvent[]
  linkedProjects: Project[]
  errors: PartialLoadErrors
}

export function PaintDetailView({
  stock,
  paint,
  events,
  linkedProjects,
  errors,
  showPurchaseDialog,
  showReleaseDialog,
  setShowPurchaseDialog,
  setShowReleaseDialog,
  handlePurchase,
  handleRelease,
  handleBackToList,
}: PaintDetailViewProps) {
  // NOTE (#167): stock === null は (a) 在庫レコード未存在 (b) loader で stock 取得失敗
  // (= errors.stock 在) の両方を含む。後者の場合も本 not-found 画面に fall through
  // するため warning Alert は表示されない (KitDetail と同仕様)。
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

      {/* Identification */}
      <Stack spacing={1}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          {paint.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {paint.brand} · {paint.code}
        </Typography>
      </Stack>

      {/* 部分失敗の warning (#167)。loader の任意 query が rejected したとき
          1 ヶ所にまとめて表示。各セクション本体は通常通り render (空配列等の fallback で)。 */}
      {hasPartialErrors(errors) && (
        <Alert severity="warning" variant="outlined">
          <AlertTitle>一部データの取得に失敗しました</AlertTitle>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {errors.events && (
              <Typography variant="body2">履歴 (paint_events): {errors.events}</Typography>
            )}
            {errors.projects && (
              <Typography variant="body2">紐付きプロジェクト: {errors.projects}</Typography>
            )}
            {errors.stock && (
              <Typography variant="body2">在庫 (paint_stock): {errors.stock}</Typography>
            )}
          </Stack>
        </Alert>
      )}

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

function hasPartialErrors(errors: PartialLoadErrors): boolean {
  return Boolean(errors.stock || errors.events || errors.projects)
}
