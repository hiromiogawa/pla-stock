import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { LandingView } from '~/views/LandingView'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { userId } = await auth()
    if (userId) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingView,
})
