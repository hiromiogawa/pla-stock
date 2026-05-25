import { createFileRoute } from '@tanstack/react-router'
import { getKit } from '~/entities/kit'
import type { Paint } from '~/entities/paint'
import { getPaints } from '~/entities/paint'
import { getProject, getProjectPaintUses, getProjectPhotos } from '~/entities/project'
import { ProjectDetailView } from '~/views/ProjectDetailView'
import { useProjectDetail } from '~/views/ProjectDetailView/useProjectDetail'

/**
 * ProjectDetail loader の部分失敗エラー (#167)。
 *
 * 設計判断: project は必須 (失敗時は throw → DefaultCatchBoundary)。
 * kit / paintUses / photos / allPaints は **任意**、失敗時は空相当の値で fallback +
 * View 側で warning notification を表示。KitDetail (#167 1 例実装) と同型。
 *
 * NOTE: 同型は View 側 (`ProjectDetailView.tsx`) に `PartialLoadErrors` として別途
 * 定義 (FSD: routes/ → views/ は単方向違反のため import 不可)。
 */
type ProjectDetailLoadErrors = {
  kit?: string
  paintUses?: string
  photos?: string
  allPaints?: string
}

function formatError(reason: unknown): string {
  if (reason instanceof Error) return reason.message
  return String(reason)
}

export const Route = createFileRoute('/_auth/projects/$id')({
  loader: async ({ params }) => {
    // project は必須 — 取得失敗時は loader 全体が reject (DefaultCatchBoundary で扱う)。
    const project = await getProject({ data: { projectId: params.id } })
    if (!project) {
      const emptyErrors: ProjectDetailLoadErrors = {}
      return {
        project: null,
        kit: null,
        paintsForProject: [],
        allPaints: [],
        photos: [],
        errors: emptyErrors,
      }
    }

    // 任意 query は Promise.allSettled で部分失敗を許容 (#167)。
    const [kitResult, paintUsesResult, photosResult, allPaintsResult] = await Promise.allSettled([
      getKit({ data: { kitId: project.kitId } }),
      getProjectPaintUses({ data: { projectId: project.id } }),
      getProjectPhotos({ data: { projectId: project.id } }),
      getPaints(),
    ])

    const errors: ProjectDetailLoadErrors = {}

    const kit = kitResult.status === 'fulfilled' ? kitResult.value : null
    if (kitResult.status === 'rejected') errors.kit = formatError(kitResult.reason)

    const photos = photosResult.status === 'fulfilled' ? photosResult.value : []
    if (photosResult.status === 'rejected') errors.photos = formatError(photosResult.reason)

    const allPaints = allPaintsResult.status === 'fulfilled' ? allPaintsResult.value : []
    if (allPaintsResult.status === 'rejected') {
      errors.allPaints = formatError(allPaintsResult.reason)
    }

    // paintsForProject は paintUses + allPaints 両方成功時のみ正確に計算可能。
    // 片方でも失敗していれば空配列で fallback (warning Alert で詳細を user に通知)。
    let paintsForProject: Paint[] = []
    if (paintUsesResult.status === 'fulfilled' && allPaintsResult.status === 'fulfilled') {
      const paintById = new Map(allPaintsResult.value.map((paint) => [paint.id, paint]))
      paintsForProject = paintUsesResult.value
        .map((link) => paintById.get(link.paintId))
        .filter((paint): paint is NonNullable<typeof paint> => paint !== undefined)
    }
    if (paintUsesResult.status === 'rejected') {
      errors.paintUses = formatError(paintUsesResult.reason)
    }

    return { project, kit, paintsForProject, allPaints, photos, errors }
  },
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const data = Route.useLoaderData()
  const hookProps = useProjectDetail({ project: data.project })
  return <ProjectDetailView {...data} {...hookProps} />
}
