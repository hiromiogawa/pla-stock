/**
 * 認証済みエリアの主要ナビ項目。モバイル BottomTabBar / デスクトップ Sidebar 共通で使う。
 * Phase A-1 では dashboard のみ実リンクを持つ。Kit/Paint/Project/Settings は Phase A-2 以降で active 化。
 */
export type NavItem = {
  key: string
  label: string
  to: string
  /** A-2 以降でルートを追加するまでは disabled: true で灰色表示する */
  disabled?: boolean
}

export const APP_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'ホーム', to: '/app' },
  { key: 'kits', label: 'キット', to: '/app/kits', disabled: true },
  { key: 'paints', label: '塗料', to: '/app/paints', disabled: true },
  { key: 'projects', label: 'プロジェクト', to: '/app/projects', disabled: true },
  { key: 'settings', label: '設定', to: '/app/settings', disabled: true },
]
