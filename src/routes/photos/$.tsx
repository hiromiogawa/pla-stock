import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects, projectPhotos } from '~/entities/project/schema'

/**
 * project 写真の配信 server route。
 *
 * - `<img src="/photos/{r2Key}">` から叩かれる GET エンドポイント。r2Key は
 *   slash 入り（`{userId}/{yyyy}/{mm}/{uuid}.{ext}`）のため splat（`$`）で捕捉
 * - `_auth` 配下に置かない: `_auth` の redirect gate は <img> から辿れない。
 *   handler 内で自前 auth() し、未認証・非所有とも 404（存在を漏らさない）
 * - R2 の httpMetadata に保存した Content-Type をそのまま返す
 */
const notFoundResponse = () => new Response('Not Found', { status: 404 })

export const Route = createFileRoute('/photos/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { userId } = await auth()
        if (!userId) return notFoundResponse()

        const r2Key = params._splat
        if (!r2Key) return notFoundResponse()

        const db = createDb(env.DB)
        const row = await db
          .select({ id: projectPhotos.id })
          .from(projectPhotos)
          .innerJoin(projects, eq(projectPhotos.projectId, projects.id))
          .where(and(eq(projectPhotos.r2Key, r2Key), eq(projects.userId, userId)))
          .get()
        if (!row) return notFoundResponse()

        const object = await env.BUCKET.get(r2Key)
        if (!object) return notFoundResponse()

        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
            'Cache-Control': 'private, max-age=3600',
          },
        })
      },
    },
  },
})
