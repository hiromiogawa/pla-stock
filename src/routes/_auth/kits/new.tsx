import { createFileRoute } from '@tanstack/react-router'
import { getKits } from '~/entities/kit'
import { KitAddView } from '~/views/KitAddView'
import { useKitAdd } from '~/views/KitAddView/useKitAdd'

export const Route = createFileRoute('/_auth/kits/new')({
  loader: async () => {
    const kits = await getKits()
    return { kits }
  },
  component: KitAddRoute,
})

function KitAddRoute() {
  const { kits } = Route.useLoaderData()
  const hookProps = useKitAdd()
  return <KitAddView kits={kits} {...hookProps} />
}
