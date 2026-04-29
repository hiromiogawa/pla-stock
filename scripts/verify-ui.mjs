#!/usr/bin/env node
/**
 * UI 変更時の visual verification 自動化スクリプト。
 *
 * 役割:
 *   主要 URL × viewport × color scheme で screenshot を撮影し
 *   `.playwright-snapshots/` に保存。pre-push hook が UI ファイル
 *   (src/views/, src/widgets/, src/theme/, src/styles/, src/components/) の
 *   変更を検出した時、本スクリプトの実行が必須となる。
 *
 * 使い方:
 *   pnpm verify:ui                # localhost:3000 (= pnpm dev) に対して実行
 *   DEV_URL=http://...:N pnpm verify:ui   # 別 URL を指定
 *
 * 前提:
 *   - dev server (`pnpm dev`) もしくは vite preview が起動済
 *   - chromium 済 (`pnpm exec playwright install chromium`)
 *
 * 関連:
 *   - .husky/pre-push       UI 変更検出時に本スクリプト実行を強制
 *   - docs/ai-failures.md   skill 未経由 / screenshot 未確認の失敗事例
 *   - CLAUDE.md `## AI 運用ルール`
 */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const DEV_URL = process.env.DEV_URL ?? 'http://localhost:3000'
const SNAPSHOT_DIR = '.playwright-snapshots'

mkdirSync(SNAPSHOT_DIR, { recursive: true })

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
]

const COLOR_SCHEMES = ['light', 'dark']

/**
 * 検証対象 URL。
 * 認証 gate 配下 (/dashboard, /kits/:id 等) は Clerk セッションが必要なため
 * 現時点ではスコープ外。/ (LandingView) のみ。将来 mock auth or
 * Clerk test mode 検討時に拡張。
 */
const URLS = ['/']

const browser = await chromium.launch()
const results = []

for (const colorScheme of COLOR_SCHEMES) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme,
    })
    const page = await context.newPage()
    for (const path of URLS) {
      const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '_')
      const filename = `${SNAPSHOT_DIR}/${slug}-${viewport.name}-${colorScheme}.png`
      try {
        await page.goto(`${DEV_URL}${path}`, { waitUntil: 'networkidle', timeout: 10_000 })
        await page.waitForTimeout(500)
        await page.screenshot({ path: filename, fullPage: true })
        console.log(`✓ ${filename}`)
        results.push({ filename, status: 'ok' })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`✗ ${filename}: ${message}`)
        results.push({ filename, status: 'error', message })
      }
    }
    await context.close()
  }
}

await browser.close()

const failed = results.filter((result) => result.status === 'error')
if (failed.length > 0) {
  console.error(`\n❌ ${failed.length}/${results.length} screenshots failed`)
  process.exit(1)
}

console.log(`\n✅ ${results.length} screenshots saved to ${SNAPSHOT_DIR}/`)
