#!/usr/bin/env node
// docs/adr/*.md の見出し・ステータス・日付から docs/adr/README.md (ADR 索引) を生成。
// ADR ファイル群が SSoT。--check で「生成結果 == 現 README.md」を検証 (exit 1 if drift)。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ADR_DIR = 'docs/adr'
const INDEX_FILE = join(ADR_DIR, 'README.md')

/**
 * ステータス文字列を索引用の短い表記に正規化する。
 * ADR 本文の表記揺れ (承認 / Accepted / Superseded by ... / Living document 付記) を吸収する。
 * @param {string} raw - ADR から抽出した生のステータス行
 * @returns {string} 索引テーブルに表示する短い表記
 */
function normalizeStatus(raw) {
  if (/superseded/i.test(raw)) return 'Superseded'
  if (/deprecated/i.test(raw)) return 'Deprecated'
  if (/proposed/i.test(raw)) return 'Proposed'
  if (/承認|accepted/i.test(raw)) return '承認'
  return raw.trim()
}

/**
 * 1 つの ADR ファイルから索引エントリ (番号 / タイトル / ステータス / 日付) を抽出する。
 * ステータスは `- ステータス: X` 形式と `## ステータス` 見出し形式の両方に対応する。
 * @param {string} file - ADR ファイル名 (例: `0001-tooling.md`)
 * @returns {{ num: string, title: string, status: string, date: string, file: string }}
 */
function parseAdr(file) {
  const text = readFileSync(join(ADR_DIR, file), 'utf8')
  const heading = text.match(/^#\s*ADR-(\d+):\s*(.+)$/m)
  if (!heading) {
    console.error(`ADR heading not found in ${file}`)
    process.exit(2)
  }
  const statusLine =
    text.match(/^-\s*ステータス:\s*(.+)$/m) || text.match(/^##\s*ステータス\s*\n+\s*(.+)$/m)
  const dateLine = text.match(/^-\s*日付:\s*(.+)$/m)
  const isoDate = dateLine ? dateLine[1].match(/\d{4}-\d{2}-\d{2}/) : null
  return {
    num: heading[1],
    title: heading[2].trim(),
    status: statusLine ? normalizeStatus(statusLine[1]) : '—',
    date: isoDate ? isoDate[0] : '—',
    file,
  }
}

function collectAdrs() {
  return readdirSync(ADR_DIR)
    .filter((name) => /^\d+-.+\.md$/.test(name))
    .sort()
    .map(parseAdr)
}

function renderIndex(adrs) {
  const lines = [
    '<!-- このファイルは scripts/gen-adr-index.mjs が生成する。手動編集禁止。 -->',
    '# ADR 索引',
    '',
    '`docs/adr/` の全 ADR 一覧。ADR 本文が SSoT で、本索引は `pnpm gen:adr-index` で再生成する。',
    '',
    '| ADR | タイトル | ステータス | 日付 |',
    '|---|---|---|---|',
  ]
  for (const adr of adrs) {
    lines.push(`| [ADR-${adr.num}](./${adr.file}) | ${adr.title} | ${adr.status} | ${adr.date} |`)
  }
  lines.push('')
  return lines.join('\n')
}

function main() {
  const generated = renderIndex(collectAdrs())
  if (process.argv.includes('--check')) {
    let current = ''
    try {
      current = readFileSync(INDEX_FILE, 'utf8')
    } catch {
      current = ''
    }
    if (current !== generated) {
      console.error('adr-index drift: run `pnpm gen:adr-index` and commit')
      process.exit(1)
    }
    console.log('adr-index OK (no drift)')
    return
  }
  writeFileSync(INDEX_FILE, generated)
  console.log(`adr-index generated into ${INDEX_FILE}`)
}

main()
