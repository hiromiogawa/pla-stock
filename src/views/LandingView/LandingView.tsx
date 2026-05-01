import { SignInButton, SignUpButton } from '@clerk/tanstack-react-start'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FolderKanban, Package, Palette } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '~/shared/ui/button'

/**
 * 未認証ユーザー向けランディング。
 *
 * Refined Minimalism craft (Linear / Notion 流) に整合:
 *   - hero は上寄せで density 確保 (flex center で空白が空くのを避ける)
 *   - subheadline は body1 で主役を持たせ、headline と階層をつける
 *   - 3-feature grid で「何の app か」を瞬時に説明
 *
 * MUI sx の `maxWidth` に number を渡すと px 解釈のため文字列 px で指定。
 */
export function LandingView() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* Header */}
      <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: '896px',
            mx: 'auto',
            px: { xs: 3, md: 6 },
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            pla-stock
          </Typography>
        </Box>
      </Box>

      {/* Main */}
      <Stack
        component="main"
        spacing={{ xs: 8, md: 12 }}
        sx={{
          flex: 1,
          maxWidth: '896px',
          width: '100%',
          mx: 'auto',
          px: { xs: 3, md: 6 },
          pt: { xs: 8, md: 14 },
          pb: { xs: 10, md: 16 },
        }}
      >
        {/* Hero */}
        <Stack spacing={4} sx={{ textAlign: 'center', maxWidth: '672px', mx: 'auto' }}>
          <Stack spacing={2}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.025em',
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.15,
              }}
            >
              プラモデル・塗料の在庫管理
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.0625rem' },
                // CJK: 単語 (CJK 文字列) を字間で割らず、空白でのみ break させる。
                wordBreak: 'keep-all',
              }}
            >
              持っているキット・塗料を登録し、製作プロジェクトごとに紐付ける モデラー向けツール。
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ pt: 2 }}
          >
            <SignInButton mode="modal">
              <Button size="lg" sx={{ minWidth: 160 }}>
                ログイン
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="lg" variant="outline" sx={{ minWidth: 160 }}>
                サインアップ
              </Button>
            </SignUpButton>
          </Stack>
        </Stack>

        {/* Feature grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 4, md: 5 },
          }}
        >
          <FeatureCell
            icon={<Package size={24} strokeWidth={1.75} />}
            title="キット"
            description="持っているキットを登録、グレード / スケール / 在庫数で管理。"
          />
          <FeatureCell
            icon={<Palette size={24} strokeWidth={1.75} />}
            title="塗料"
            description="brand / code / color family で分類、塗料 swatch で一目で識別。"
          />
          <FeatureCell
            icon={<FolderKanban size={24} strokeWidth={1.75} />}
            title="プロジェクト"
            description="キットと塗料を紐付け、写真と製作状態を記録。"
          />
        </Box>
      </Stack>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: '896px',
            mx: 'auto',
            px: { xs: 3, md: 6 },
            py: 3,
            fontSize: 'caption.fontSize',
            color: 'text.secondary',
          }}
        >
          © {new Date().getFullYear()} pla-stock
        </Box>
      </Box>
    </Box>
  )
}

interface FeatureCellProps {
  icon: ReactNode
  title: string
  description: string
}

function FeatureCell({ icon, title, description }: FeatureCellProps) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{icon}</Box>
      <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {description}
      </Typography>
    </Stack>
  )
}
