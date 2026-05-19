import { createFileRoute } from '@tanstack/react-router'
import { getPaints } from '~/entities/paint'
import { PaintAddView } from '~/views/PaintAddView'
import { usePaintAdd } from '~/views/PaintAddView/usePaintAdd'

export const Route = createFileRoute('/_auth/paints/new')({
  loader: async () => {
    const paints = await getPaints()
    return { paints }
  },
  component: PaintAddRoute,
})

function PaintAddRoute() {
  const { paints } = Route.useLoaderData()
  const hookProps = usePaintAdd()
  return <PaintAddView paints={paints} {...hookProps} />
}
