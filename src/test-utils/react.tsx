import { ThemeProvider, createTheme } from '@mui/material/styles'
import { type RenderHookOptions, renderHook } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import type { PropsWithChildren, ReactElement } from 'react'

const testTheme = createTheme()

/**
 * Hook テスト用 wrapper。MUI Theme + notistack SnackbarProvider を装着する。
 *
 * TanStack Router 系 hook (useNavigate / useRouter) を呼ぶ hook をテストする
 * 場合は、各 test で `vi.mock('@tanstack/react-router')` を併用する
 * (RouterProvider は route tree の component を render する設計のため、
 * renderHook の wrapper としては相性が悪く本 helper には含めない)。
 */
function Providers({ children }: PropsWithChildren): ReactElement {
  return (
    <ThemeProvider theme={testTheme}>
      <SnackbarProvider>{children}</SnackbarProvider>
    </ThemeProvider>
  )
}

/**
 * renderHook の薄い wrapper。`<MUI Theme><notistack>{children}</></>` を装着する。
 *
 * 使用例:
 *   const { result } = renderHookWithProviders(() => useKitDetail({...}))
 */
export function renderHookWithProviders<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>,
) {
  return renderHook(callback, { wrapper: Providers, ...options })
}
