import { UserButton } from '@clerk/tanstack-react-start'
import Box from '@mui/material/Box'
import { Link } from '@tanstack/react-router'
import { APP_NAV_ITEMS } from '~/shared/config/nav'

/**
 * モバイル (< md) で画面下部に固定表示する TabBar。
 *
 * active link は TanStack Router の Link が active 時に自動付与する
 * `className="active"` を sx の `&.active` セレクタで拾って styling する。
 */
export function BottomTabBar() {
  return (
    <Box
      component="nav"
      sx={(theme) => ({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        display: { xs: 'block', md: 'none' },
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      })}
    >
      <Box component="ul" sx={{ display: 'flex', margin: 0, padding: 0, listStyle: 'none' }}>
        {APP_NAV_ITEMS.map((item) => (
          <Box component="li" key={item.key} sx={{ flex: 1 }}>
            {item.disabled ? (
              <Box
                role="link"
                aria-disabled="true"
                title="Phase A-2 以降で実装"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2,
                  fontSize: 'caption.fontSize',
                  color: 'text.disabled',
                }}
              >
                {item.label}
              </Box>
            ) : (
              <Box
                component={Link}
                to={item.to}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2,
                  fontSize: 'caption.fontSize',
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                  '&.active': { color: 'text.primary', fontWeight: 600 },
                }}
              >
                {item.label}
              </Box>
            )}
          </Box>
        ))}
        <Box
          component="li"
          sx={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
          }}
        >
          <UserButton />
        </Box>
      </Box>
    </Box>
  )
}
