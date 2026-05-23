import type { Project } from '~/entities/project'

/**
 * テスト用 Project factory。overrides で差分のみ指定する。
 */
export function createTestProject(overrides: Partial<Project> = {}): Project {
  return {
    id: `project-${crypto.randomUUID()}`,
    userId: 'user-test-1',
    kitId: `kit-${crypto.randomUUID()}`,
    name: 'Test Project',
    description: null,
    status: 'planning',
    startedAt: null,
    completedAt: null,
    ...overrides,
  }
}
