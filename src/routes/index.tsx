import { createFileRoute, redirect } from '@tanstack/react-router'
import { fetchClerkAuth } from '~/shared/lib/auth'
import { LandingView } from '~/views/LandingView'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { userId } = await fetchClerkAuth()
    if (userId) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingView,
})
