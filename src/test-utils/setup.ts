import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * 全 test 共通 setup。vitest.config.ts の `test.setupFiles` から起動。
 *
 * - `@testing-library/react` の `cleanup` を afterEach で実行 (DOM を空に戻す)。
 *   globals: false 設定下では auto-cleanup が効かないため明示注入が必要。
 */
afterEach(() => {
  cleanup()
})
