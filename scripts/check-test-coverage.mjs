#!/usr/bin/env node
// testing skill ルール 2 / 3 の「対象には *.test.{ts,tsx} を必ず併設」を機械検証する。
//
// 対象:
//   ルール 2 (Unit):       src/features/*/schemas.ts のうち *Input Zod schema を export しているもの
//   ルール 3a (Integration): src/views/*/use*.ts (test 除く)
//   ルール 3b (Integration): src/features/*/*ToDb.ts (test 除く)
//
// 既知の paper tiger (#173 / FAIL-006) の機械強制実装。
//
// 動作モード:
//   warning モード (default):  違反一覧を stderr に出して exit 0 (CI を落とさない、段階移行用)
//   strict モード (--strict):  違反 1 件以上で exit 1 (#172 で既存 12 違反解消後の最終形)
//
// CI: `.github/workflows/ci.yml` の matrix で `pnpm check:test-coverage` を起動。

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const STRICT = process.argv.includes('--strict')

/** 指定ディレクトリを再帰的に走査し、全ファイルパスを返す。存在しなければ空配列。 */
function walk(dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walk(full))
    } else {
      files.push(full)
    }
  }
  return files
}

/** 同じ basename の `.test.ts` / `.test.tsx` が同 dir に存在するか。 */
function hasTestSibling(file) {
  const lastSlash = file.lastIndexOf('/')
  const dir = file.substring(0, lastSlash)
  const base = file.substring(lastSlash + 1).replace(/\.tsx?$/, '')
  for (const ext of ['ts', 'tsx']) {
    try {
      statSync(join(dir, `${base}.test.${ext}`))
      return true
    } catch {
      // 存在しない場合は次の拡張子を試す
    }
  }
  return false
}

const violations = []

// ルール 2: features/*/schemas.ts の *Input Zod schema export
const featureSchemas = walk('src/features').filter(
  (file) => file.endsWith('/schemas.ts') && !file.endsWith('.test.ts'),
)
for (const file of featureSchemas) {
  const content = readFileSync(file, 'utf-8')
  if (/export const \w+Input\b/.test(content) && !hasTestSibling(file)) {
    violations.push(`[rule 2 Unit]      ${file}`)
  }
}

// ルール 3a: views/*/use*.ts
const viewHooks = walk('src/views').filter(
  (file) => /\/use[A-Z]\w*\.ts$/.test(file) && !file.endsWith('.test.ts'),
)
for (const file of viewHooks) {
  if (!hasTestSibling(file)) {
    violations.push(`[rule 3a Hook]     ${file}`)
  }
}

// ルール 3b: features/*/*ToDb.ts
const featureToDb = walk('src/features').filter(
  (file) => /\w+ToDb\.ts$/.test(file) && !file.endsWith('.test.ts'),
)
for (const file of featureToDb) {
  if (!hasTestSibling(file)) {
    violations.push(`[rule 3b *ToDb]    ${file}`)
  }
}

if (violations.length === 0) {
  console.log('check-test-coverage OK (0 violations)')
  process.exit(0)
}

const header = STRICT
  ? `check-test-coverage: ${violations.length} violation(s) — STRICT mode`
  : `check-test-coverage: ${violations.length} pending — WARNING mode (段階移行中、--strict で error 化)`

const out = STRICT ? console.error : console.warn
out(header)
for (const violation of violations) {
  out(`  ${violation}`)
}
out('')
out(
  '対応: ADR-0016 / .claude/skills/testing/SKILL.md ルール 2/3 に従い、同 dir に *.test.ts を併設する。',
)
out('追跡 Issue: #172 (横展開) / #173 (本機械強制)')

process.exit(STRICT ? 1 : 0)
