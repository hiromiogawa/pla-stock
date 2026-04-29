/**
 * Theme mode (light / dark) の永続化と切替を担う Provider。
 *
 * 設計 (Phase 1 minimal):
 *   - 初期値: localStorage > system pref の順で解決
 *   - 切替: useThemeMode().setMode で localStorage 永続
 *   - SSR: server では system pref / localStorage 取得不可なので 'light' で render
 *     (= 初回 hydrate 直後に dark へ切替で短時間 flash 発生、Phase 2 で cookie 対応予定)
 *
 * 関連: docs/specs/2026-04-29-design-direction.md
 */
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createAppTheme, type ThemeMode } from '~/theme'

const STORAGE_KEY = 'pla-stock-theme-mode'

interface ThemeModeContextValue {
  /** 現在の有効モード (system pref を解決済み) */
  mode: ThemeMode
  /** モード切替 */
  setMode: (next: ThemeMode) => void
  /** light <-> dark トグル */
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

/** Provider 配下から現在のモードと切替 API を取得 */
export function useThemeMode(): ThemeModeContextValue {
  const value = useContext(ThemeModeContext)
  if (!value) {
    throw new Error('useThemeMode must be used within ThemeModeProvider')
  }
  return value
}

interface ThemeModeProviderProps {
  children: ReactNode
}

/**
 * Theme mode を管理する Provider。
 * MUI ThemeProvider の上位に配置し、子の `useThemeMode()` で切替可能にする。
 */
export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('light')

  // 初回 mount で localStorage > system pref の順で resolve
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      setModeState(stored)
      return
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setModeState(prefersDark ? 'dark' : 'light')
  }, [])

  // system pref 変更を listen (localStorage に値がある場合は無視)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event: MediaQueryListEvent) => {
      setModeState(event.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  const theme = useMemo(() => createAppTheme(mode), [mode])

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  )

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeModeContext.Provider>
  )
}
