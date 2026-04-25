import type { User, UserRole } from '~/entities/user'

/**
 * Phase A-1 用の疑似セッション。
 * 常にログイン済として扱い、認証実装抜きで UI フローを検証できるようにする。
 * Phase C で Better-Auth 実装に差し替える。
 */
const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'mock@pla-stock.test',
  name: 'モックユーザー',
  image: null,
  role: 'user',
}

const MOCK_ADMIN: User = {
  id: 'mock-admin-1',
  email: 'admin@pla-stock.test',
  name: 'モック管理者',
  image: null,
  role: 'admin',
}

export type MockSession = {
  user: User
} | null

let currentSession: MockSession = { user: MOCK_USER }

/** 現在のモックセッションを返す。ログイン中なら `{ user }`、ログアウト中なら `null`。 */
export function getMockSession(): MockSession {
  return currentSession
}

/** モックログイン: user または admin を選んでセッション開始。 */
export function mockLogin(role: UserRole = 'user'): void {
  currentSession = { user: role === 'admin' ? MOCK_ADMIN : MOCK_USER }
}

/** モックログアウト: セッションを null に。 */
export function mockLogout(): void {
  currentSession = null
}
