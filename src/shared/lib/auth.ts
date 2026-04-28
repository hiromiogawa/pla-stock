import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'

/**
 * Clerk の auth state を server-side で取得する server function。
 *
 * `_auth.tsx` / `index.tsx` の `beforeLoad` から呼ぶ。`beforeLoad` は
 * 初回 SSR とクライアント遷移の両方で実行されるが、`auth()` を直接
 * 呼ぶと client-side で server context が無く落ちる
 * ("Cannot read properties of undefined (reading 'auth')")。
 *
 * createServerFn でラップすることで、どちらのケースでも内部実行は
 * 必ず server-side で、クライアントからは fetch RPC で値を受け取る
 * 形になり安全。
 */
export const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  return { userId }
})
