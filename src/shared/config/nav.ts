/**
 * 認証済みエリアの主要ナビ項目。モバイル BottomTabBar / デスクトップ Sidebar 共通で使う。
 * Settings は Issue #22 (Story) で実装後に enable する。
 */
export type NavItem = {
  key: string
  label: string
  to: string
  /** ルート未実装の項目は disabled: true で灰色表示する */
  disabled?: boolean
}

export const APP_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'ホーム', to: '/dashboard' },
  { key: 'kits', label: 'キット', to: '/kits' },
  { key: 'paints', label: '塗料', to: '/paints' },
  { key: 'projects', label: 'プロジェクト', to: '/projects' },
  { key: 'settings', label: '設定', to: '/settings', disabled: true },
]
