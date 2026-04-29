import Box from '@mui/material/Box'
import type { PropsWithChildren } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          // md+ では Sidebar が position:fixed (width 14rem) なので margin-left を設定
          marginLeft: { xs: 0, md: '14rem' },
          pb: { xs: 12, md: 0 },
        }}
      >
        {children}
      </Box>
      <BottomTabBar />
    </Box>
  )
}
