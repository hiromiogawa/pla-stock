#!/usr/bin/env node
// View 純粋性 (#43 Container/Hook/Presenter) を機械強制する。
//
// 役割:
//   View (Presenter) が pure (props in / JSX out) であることを保証する。
//   state / 副作用 / mutation は useXxx hook に隔離。
//
// 対象 + 禁止内容:
//   mutationView (*DetailView.tsx / *AddView.tsx / *CreateView.tsx):
//     - react から useState / useEffect / useReducer の import 禁止
//     - ~/features/* (mutation server fn) の import 禁止
//   listView (*ListView.tsx):
//     - filter 用 useState は inline OK
//     - ~/features/* の import 禁止 (mutation を List に置かない)
//
// 経緯:
//   元は `lint-config/oxlint-view-purity.jsonc` で oxlint の `no-restricted-imports`
//   を使っていたが、oxlint 1.61 の `paths + importNames` 形式が機能せず paper tiger
//   化していた (FAIL-005 / ADR-0007、Issue #155)。
//   `patterns + group` 形式は package 単位の glob 制限しかできず、特定 named import
//   (useState 等) の禁止には不適。
//   → custom script で機械強制し直す (#155、本ファイル)。
//
// 動作モード:
//   strict モード (--strict): 違反 1 件以上で exit 1 (= CI gate、default は本モード)
//   warning モード:           違反一覧を stderr に出して exit 0
//
// CI / pre-commit:
//   `.github/workflows/ci.yml` の matrix と pre-commit の `check:parallel` で起動
//   (package.json で --strict 付き)。

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

/**
 * 行頭 import statement から指定 named import を含むかを判定。
 * 例: `import { useState, useMemo } from 'react'` で named=`useState` → true
 *
 * 同一 source ('react' / '~/features/...') のチェックも兼ねる。
 */
function importsNamed(line, sourcePattern, named) {
  // `import { ... } from 'src'` 形式のみ対象 (default import / 名前空間 import は除外)
  const match = line.match(/^\s*import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/)
  if (!match) return false
  const [, importsRaw, source] = match
  if (!sourcePattern.test(source)) return false
  if (named === null) return true // 全 named import 禁止 (source だけ照合)
  const names = importsRaw.split(',').map((token) =>
    token
      .trim()
      .split(/\s+as\s+/)[0]
      .trim(),
  )
  return names.includes(named)
}

/**
 * file 内容を行ごとに走査し、禁止 import pattern にヒットした {lineNumber, message} を返す。
 *
 * NOTE: **単一行 import のみ対象**。multiline import (改行で分かれた `import { ... }`)
 * は現状未検知。Biome formatter は import を 1 行に保つ傾向のため即時リスクは低いが、
 * 将来 multiline 形式が増えたら全文 join + multiline regex への切替を検討。
 */
function detectViolations(file, rules) {
  const lines = readFileSync(file, 'utf8').split('\n')
  const violations = []
  for (const [lineIdx, line] of lines.entries()) {
    for (const rule of rules) {
      if (importsNamed(line, rule.source, rule.named)) {
        violations.push({
          file,
          lineNumber: lineIdx + 1,
          message: rule.message,
        })
      }
    }
  }
  return violations
}

const mutationViewRules = [
  {
    source: /^react$/,
    named: 'useState',
    message: 'View で useState を直接 import する代わりに useXxx hook に抽出 (#43)',
  },
  {
    source: /^react$/,
    named: 'useEffect',
    message: 'View で useEffect を直接 import する代わりに useXxx hook に抽出 (#43)',
  },
  {
    source: /^react$/,
    named: 'useReducer',
    message: 'View で useReducer を直接 import する代わりに useXxx hook に抽出 (#43)',
  },
  {
    source: /^~\/features\//,
    named: null,
    message: '~/features/* (mutation server fn) は useXxx hook 経由で呼ぶこと (#43)',
  },
]

const listViewRules = [
  {
    source: /^~\/features\//,
    named: null,
    message:
      '~/features/* (mutation server fn) は useXxx hook 経由で呼ぶこと (List view から直接呼ばない)',
  },
]

const allViewFiles = walk('src/views').filter((file) => file.endsWith('.tsx'))

const violations = []

for (const file of allViewFiles) {
  if (/\/[^/]*ListView\.tsx$/.test(file)) {
    violations.push(...detectViolations(file, listViewRules))
    continue
  }
  if (/\/[^/]*(?:DetailView|AddView|CreateView)\.tsx$/.test(file)) {
    violations.push(...detectViolations(file, mutationViewRules))
  }
}

if (violations.length === 0) {
  console.log('check-view-purity OK (0 violations)')
  process.exit(0)
}

const header = STRICT
  ? `check-view-purity: ${violations.length} violation(s) — STRICT mode`
  : `check-view-purity: ${violations.length} pending — WARNING mode (--strict で error 化)`

const out = STRICT ? console.error : console.warn
out(header)
for (const violation of violations) {
  out(`  ${violation.file}:${violation.lineNumber}  ${violation.message}`)
}
out('')
out(
  '対応: CLAUDE.md「Container/Hook/Presenter」節および #43 / #155 を参照、useXxx hook に state / mutation を移動する。',
)

process.exit(STRICT ? 1 : 0)
