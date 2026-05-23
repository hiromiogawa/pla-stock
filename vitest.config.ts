import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
      // 'cloudflare:workers' を test 環境で誤って import しても落ちない safety net。
      // production code は実際にこの virtual module を使うが、テストでは vi.mock で
      // 該当 module 全体を差し替えるため、本 alias は import 解決のみ通せばよい。
      'cloudflare:workers': resolve(__dirname, 'src/test-utils/__stubs__/cloudflare-workers.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false, // import { describe, it, expect } from 'vitest' を強制
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      // ADR-0016 (2026-05-23 update): coverage は **閾値 gate に採用しない** 方針。
      // 計測は許容、PR comment に参考値として出すための設定。
      // threshold (lines / branches / functions / statements) は **意図的に未設定**。
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test-utils/**',
        'src/**/*.d.ts',
        'src/**/index.ts', // barrel re-export
        'src/**/*.gen.ts',
        'src/routeTree.gen.ts',
      ],
    },
  },
})
