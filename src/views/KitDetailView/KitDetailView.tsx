import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
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

/**
 * KitDetail loader の部分失敗エラー (#167)。
 *
 * route loader (`src/routes/_auth/kits/$kitId.tsx`) の `KitDetailLoadErrors` と
 * 同型 (key 不在 = 成功、value = user 向けエラーメッセージ)。loader 側の型を
 * import しない理由: routes/ → views/ は FSD 上 NG、view は loader 形状を自分で持つ。
 */
interface PartialLoadErrors {
  stock?: string
  events?: string
  projects?: string
}

interface KitDetailViewProps extends UseKitDetailReturn {
  stock: KitStock | null
  kit: Kit | null
  events: KitEvent[]
  linkedProjects: Project[]
  errors: PartialLoadErrors
}

export function KitDetailView({
  stock,
  kit,
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
}: KitDetailViewProps) {
  // NOTE (#167): stock === null は (a) 在庫レコード未存在 (b) loader で stock 取得失敗
  // (= errors.stock 在) の両方を含む。後者の場合も本 not-found 画面に fall through
  // するため warning Alert は表示されない。事実上 stock 失敗時は detail 画面に
  // 入れない仕様 (kit と stock 両方そろわないと画面成立しないという既存判定を維持)。
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

      {/* Identification */}
      <Stack spacing={1}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
          {kit.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {kit.grade} · {kit.scale}
        </Typography>
      </Stack>

      {/* 部分失敗の warning (#167)。loader の任意 query が rejected したとき
          1 ヶ所にまとめて表示。各セクション本体は通常通り render (空配列等の fallback で)。 */}
      {hasPartialErrors(errors) && (
        <Alert severity="warning" variant="outlined">
          <AlertTitle>一部データの取得に失敗しました</AlertTitle>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {errors.events && (
              <Typography variant="body2">履歴 (kit_events): {errors.events}</Typography>
            )}
            {errors.projects && (
              <Typography variant="body2">紐付きプロジェクト: {errors.projects}</Typography>
            )}
            {errors.stock && (
              <Typography variant="body2">在庫 (kit_stock): {errors.stock}</Typography>
            )}
          </Stack>
        </Alert>
      )}

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

function hasPartialErrors(errors: PartialLoadErrors): boolean {
  return Boolean(errors.stock || errors.events || errors.projects)
}
