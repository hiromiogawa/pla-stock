import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '~/widgets/AppShell'
import { getMockSession } from '~/shared/lib/mock-auth'

export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    const session = getMockSession()
    if (!session) {
      throw redirect({ to: '/' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
