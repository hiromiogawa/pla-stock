import { drizzle } from 'drizzle-orm/d1'

/**
 * Drizzle client factory。
 *
 * server fn 内で env.DB を渡して使う:
 *   const db = createDb(env.DB)
 *   const rows = await db.select().from(kits)
 *
 * NOTE: relational query (db.query.X) を使う server fn が将来出てきた場合は、
 * その server fn で個別に schema を import し、drizzle(d1, { schema }) を直接組む
 * (FSD 上 shared から entities を import できないため、本 factory では schema を持たない)。
 */

export const createDb = (d1: D1Database) => drizzle(d1)

export type Db = ReturnType<typeof createDb>
