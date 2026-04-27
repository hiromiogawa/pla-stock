import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { fetchClerkAuth } from '~/shared/lib/auth'
import { AppShell } from '~/widgets/AppShell'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { userId } = await fetchClerkAuth()
    if (!userId) {
      throw redirect({ to: '/' })
    }
    return { userId }
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
