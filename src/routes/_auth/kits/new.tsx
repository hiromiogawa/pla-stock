import { createFileRoute } from '@tanstack/react-router'
import { getKits } from '~/entities/kit'
import { KitAddView } from '~/views/KitAddView'
import { useKitAdd } from '~/views/KitAddView/useKitAdd'

export const Route = createFileRoute('/_auth/kits/new')({
  loader: async ({ context }) => {
    const { userId } = context
    const kits = await getKits({ userId })
    return { kits, userId }
  },
  component: KitAddRoute,
})

function KitAddRoute() {
  const { kits, userId } = Route.useLoaderData()
  const hookProps = useKitAdd({ userId })
  return <KitAddView kits={kits} {...hookProps} />
}
