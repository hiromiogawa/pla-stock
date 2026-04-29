import { UserButton } from '@clerk/tanstack-react-start'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import { APP_NAV_ITEMS } from '~/shared/config/nav'

/**
 * Sidebar (md+ で表示)。
 *
 * MUI sx の `width` は number → px 解釈のため、Tailwind w-56 (14rem = 224px) は
 * `width: '14rem'` で表現する (theme.spacing は適用されない)。
 *
 * active state:
 *   TanStack Router の Link は active 時に自動で `className="active"` を付与する。
 *   `activeProps` の型は host component (TComp) の React props に固定されるため
 *   ListItemButton の `selected` prop を直接 activeProps から指定することは型エラー。
 *   代替として sx の `&.active` セレクタで MUI の `Mui-selected` 相当の styling
 *   (theme.palette.action.selected) を当てる。
 */
export function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '14rem',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 4, py: 5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="h5"
          component="span"
          sx={{ fontWeight: 600, letterSpacing: '-0.025em' }}
        >
          pla-stock
        </Typography>
      </Box>
      <Stack component="nav" spacing={0} sx={{ flex: 1, px: 1, py: 1 }}>
        {APP_NAV_ITEMS.map((item) =>
          item.disabled ? (
            <Box
              key={item.key}
              role="link"
              aria-disabled="true"
              title="Phase A-2 以降で実装"
              sx={{
                display: 'block',
                px: 1.5,
                py: 0.75,
                fontSize: '0.875rem',
                color: 'text.disabled',
                cursor: 'not-allowed',
              }}
            >
              {item.label}
            </Box>
          ) : (
            <Box
              key={item.key}
              component={Link}
              to={item.to}
              sx={{
                display: 'block',
                px: 1.5,
                py: 0.75,
                borderRadius: 0.75,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background-color 120ms, color 120ms',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                },
                '&.active': {
                  backgroundColor: 'action.selected',
                  color: 'text.primary',
                  fontWeight: 600,
                },
              }}
            >
              {item.label}
            </Box>
          ),
        )}
      </Stack>
      <Box sx={{ padding: 4, borderTop: 1, borderColor: 'divider' }}>
        <UserButton />
      </Box>
    </Box>
  )
}
