import { createFileRoute } from '@tanstack/react-router'
import { getPaint, getPaintEvents, getPaintStock } from '~/entities/paint'
import { getProjectPaintIds, getProjects } from '~/entities/project'
import { PaintDetailView } from '~/views/PaintDetailView'
import { usePaintDetail } from '~/views/PaintDetailView/usePaintDetail'

/**
 * PaintDetail loader の部分失敗エラー (#167)。
 *
 * 設計判断: paint は必須 (失敗時は throw → DefaultCatchBoundary)。
 * stock / events / linkedProjects は **任意**、失敗時は空相当の値で fallback +
 * View 側で warning notification を表示。KitDetail (#167 1 例実装) と同型。
 *
 * NOTE: 同型は View 側 (`PaintDetailView.tsx`) に `PartialLoadErrors` として別途
 * 定義 (FSD: routes/ → views/ は単方向違反のため import 不可)。
 */
type PaintDetailLoadErrors = {
  stock?: string
  events?: string
  projects?: string
}

function formatError(reason: unknown): string {
  if (reason instanceof Error) return reason.message
  return String(reason)
}

export const Route = createFileRoute('/_auth/paints/$paintId')({
  loader: async ({ params }) => {
    const paintId = params.paintId

    // paint は必須 — 取得失敗時は loader 全体が reject (DefaultCatchBoundary で扱う)。
    const paint = await getPaint({ data: { paintId } })
    if (!paint) {
      const emptyErrors: PaintDetailLoadErrors = {}
      return {
        stock: null,
        paint: null,
        events: [],
        linkedProjects: [],
        errors: emptyErrors,
      }
    }

    // 任意 query は Promise.allSettled で部分失敗を許容 (#167)。
    const [stockResult, eventsResult, projectsResult] = await Promise.allSettled([
      getPaintStock({ data: { paintId } }),
      getPaintEvents({ data: { paintId } }),
      getProjects(),
    ])

    const errors: PaintDetailLoadErrors = {}

    const stock = stockResult.status === 'fulfilled' ? stockResult.value : null
    if (stockResult.status === 'rejected') errors.stock = formatError(stockResult.reason)

    const events = eventsResult.status === 'fulfilled' ? eventsResult.value : []
    if (eventsResult.status === 'rejected') errors.events = formatError(eventsResult.reason)

    let linkedProjects: Awaited<ReturnType<typeof getProjects>> = []
    if (projectsResult.status === 'fulfilled') {
      // projects 取得成功時のみ、各 project の paintIds を引いて逆引き。
      // projectPaintIds 個別の失敗は致命でないため、内側でも allSettled で部分許容。
      const inner = await Promise.allSettled(
        projectsResult.value.map((project) =>
          getProjectPaintIds({ data: { projectId: project.id } }),
        ),
      )
      linkedProjects = projectsResult.value.filter((_, idx) => {
        const result = inner[idx]
        return result?.status === 'fulfilled' && result.value.includes(paintId)
      })
    } else {
      errors.projects = formatError(projectsResult.reason)
    }

    return { stock, paint, events, linkedProjects, errors }
  },
  component: PaintDetailRoute,
})

function PaintDetailRoute() {
  const data = Route.useLoaderData()
  const hookProps = usePaintDetail({ paint: data.paint, stock: data.stock })
  return <PaintDetailView {...data} {...hookProps} />
}
