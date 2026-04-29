import { SignInButton, SignUpButton } from '@clerk/tanstack-react-start'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '~/shared/ui/button'

/**
 * 未認証ユーザー向けランディング。
 *
 * MUI sx の `maxWidth` に number を渡すと px 解釈 (theme.spacing ではない) のため、
 * 文字列 px or breakpoint 名 (`'sm'` 等) で指定する。
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
      <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: '768px',
            mx: 'auto',
            px: 6,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h5"
            component="span"
            sx={{ fontWeight: 600, letterSpacing: '-0.025em' }}
          >
            pla-stock
          </Typography>
        </Box>
      </Box>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 6,
        }}
      >
        <Stack spacing={8} sx={{ maxWidth: '672px', width: '100%', textAlign: 'center' }}>
          <Stack spacing={3}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.025em',
                fontSize: { xs: '1.875rem', md: '2.25rem' },
                lineHeight: 1.2,
              }}
            >
              プラモデル・塗料の在庫管理
            </Typography>
            <Typography color="text.secondary">
              持っているキット・塗料を登録し、製作プロジェクトごとに紐付ける モデラー向けツール。
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <SignInButton mode="modal">
              <Button sx={{ minWidth: 120 }}>ログイン</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline">サインアップ</Button>
            </SignUpButton>
          </Stack>
        </Stack>
      </Box>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: '768px',
            mx: 'auto',
            px: 6,
            py: 4,
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
