import { createFileRoute } from '@tanstack/react-router'
import { getPaints } from '~/shared/api/mock/paints'
import { getMockSession } from '~/shared/lib/mock-auth'
import { PaintAddView } from '~/views/PaintAddView'

export const Route = createFileRoute('/app/paints/new')({
  loader: async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const paints = await getPaints({ userId })
    return { paints, userId }
  },
  component: PaintAddRoute,
})

function PaintAddRoute() {
  const { paints, userId } = Route.useLoaderData()
  return <PaintAddView paints={paints} userId={userId} />
}
