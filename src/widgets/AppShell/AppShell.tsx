import type { PropsWithChildren } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomTabBar />
    </div>
  )
}
