import { createFileRoute } from '@tanstack/react-router'
import { getPaints } from '~/entities/paint'
import { PaintAddView } from '~/views/PaintAddView'
import { usePaintAdd } from '~/views/PaintAddView/usePaintAdd'

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
  const hookProps = usePaintAdd({ userId })
  return <PaintAddView paints={paints} {...hookProps} />
}
