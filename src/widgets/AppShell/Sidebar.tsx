import { UserButton } from '@clerk/tanstack-react-start'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import {
  FolderKanban,
  Home,
  type LucideIcon,
  Moon,
  Package,
  Palette,
  Settings,
  Sun,
} from 'lucide-react'
import { APP_NAV_ITEMS, type NavItem } from '~/shared/config/nav'
import { useThemeMode } from '~/theme/ThemeModeProvider'

/**
 * Sidebar (md+ で表示)。
 *
 * デザイン方針: Refined Minimalism (Linear / Notion / Vercel 風)。
 * 詳細は docs/specs/2026-04-29-design-direction.md。
 *
 * - 14px medium body / weight contrast で hierarchy
 * - lucide icon 16px stroke 1.75 (default の 2 より craft 感)
 * - hover/active で bg + color + weight を多軸変化
 * - hairline divider で構造を区切る
 * - active state は TanStack Router の自動 className "active" を sx の `&.active` で pickup
 */

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: Home,
  kits: Package,
  paints: Palette,
  projects: FolderKanban,
  settings: Settings,
}

export function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '14rem',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'text.primary',
          }}
        >
          pla-stock
        </Typography>
      </Box>

      {/* Nav */}
      <Stack component="nav" spacing={0.25} sx={{ flex: 1, px: 1.5, pt: 1 }}>
        {APP_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.key} item={item} />
        ))}
      </Stack>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <UserButton />
        <ThemeToggle />
      </Box>
    </Box>
  )
}

/**
 * light <-> dark の手動切替トグル。
 * Sidebar footer の右端に配置 (UserButton の隣)、refined minimalism として
 * 16px lucide icon + ghost IconButton で控えめに。
 */
function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'
  return (
    <IconButton
      size="small"
      onClick={toggleMode}
      aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
      sx={{ color: 'text.secondary' }}
    >
      {isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
    </IconButton>
  )
}

interface SidebarItemProps {
  item: NavItem
}

function SidebarItem({ item }: SidebarItemProps) {
  const Icon = ICON_MAP[item.key] ?? Home

  if (item.disabled) {
    return (
      <Box
        role="link"
        aria-disabled="true"
        title="Phase A-2 以降で実装"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.disabled',
          cursor: 'not-allowed',
        }}
      >
        <Icon size={16} strokeWidth={1.75} />
        {item.label}
      </Box>
    )
  }

  return (
    <Box
      component={Link}
      to={item.to}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 0.75,
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'text.secondary',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background-color 120ms ease, color 120ms ease',
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
      <Icon size={16} strokeWidth={1.75} />
      {item.label}
    </Box>
  )
}
