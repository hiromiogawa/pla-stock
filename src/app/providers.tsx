import type { PropsWithChildren } from 'react'

/**
 * Application-wide providers. Phase A-1 はまだ何も wrap しないが、
 * 将来 TanStack Query / TanStack Store / Better-Auth 等を重ねる起点にする。
 */
export function AppProviders({ children }: PropsWithChildren) {
  return <>{children}</>
}
