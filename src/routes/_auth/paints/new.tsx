import { createFileRoute } from '@tanstack/react-router'
import { getPaints } from '~/shared/api/mock/paints'
import { PaintAddView } from '~/views/PaintAddView'

export const Route = createFileRoute('/_auth/paints/new')({
  loader: async ({ context }) => {
    const { userId } = context
    const paints = await getPaints({ userId })
    return { paints, userId }
  },
  component: PaintAddRoute,
})

function PaintAddRoute() {
  const { paints, userId } = Route.useLoaderData()
  return <PaintAddView paints={paints} userId={userId} />
}
