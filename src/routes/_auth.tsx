import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { AppShell } from '~/widgets/AppShell'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { userId } = await auth()
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
