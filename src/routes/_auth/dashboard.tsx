import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '~/views/DashboardView'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardView,
})
