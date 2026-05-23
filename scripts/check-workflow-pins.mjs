#!/usr/bin/env node
// .github/workflows/*.{yml,yaml} の `uses:` を走査し、third-party action が
// commit SHA で pin されているか機械検証する。違反があれば exit 1。
//
// ルール:
//   - first-party (actions/* org) は version tag OK
//   - third-party は 40 文字 hex の commit SHA pin 必須 (supply chain 攻撃対策)
//   - local action (./<path>) はリポジトリ内ファイルのため除外
//
// 関連: 2026-05-23 ユーザー指摘 / PR #157
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const WORKFLOWS_DIR = '.github/workflows'
const SHA_RE = /^[0-9a-f]{40}$/
const USES_RE = /^\s*(?:-\s+)?uses:\s*['"]?([^'"#\s]+)/

/**
 * 1 ワークフローファイルから `uses:` 行を抽出し、third-party SHA pin 規約への
 * 違反を返す。
 * @param {string} path - ファイルパス (例: `.github/workflows/ci.yml`)
 * @returns {Array<{ path: string, lineNumber: number, ref: string, reason: string }>}
 */
function checkFile(path) {
  const content = readFileSync(path, 'utf8')
  const violations = []
  const lines = content.split('\n')
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    const match = line.match(USES_RE)
    if (!match) continue
    const ref = match[1]
    // local action (./<path> または ../<path>) はリポジトリ内コードなので除外
    if (ref.startsWith('./') || ref.startsWith('../')) continue
    const [actionPath, version] = ref.split('@')
    if (!version) {
      violations.push({
        path,
        lineNumber: lineIndex + 1,
        ref,
        reason: `"${ref}" に @ref がない`,
      })
      continue
    }
    const org = actionPath.split('/')[0]
    // GitHub 公式の actions/* org は first-party 扱いで version tag を許容
    if (org === 'actions') continue
    if (!SHA_RE.test(version)) {
      violations.push({
        path,
        lineNumber: lineIndex + 1,
        ref,
        reason: `third-party action "${actionPath}" が "${version}" で pin されている (40 文字 hex の commit SHA を要求)`,
      })
    }
  }
  return violations
}

function collectWorkflows(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => /\.ya?ml$/.test(name))
    .map((name) => join(dir, name))
    .filter((path) => statSync(path).isFile())
}

function main() {
  const files = collectWorkflows(WORKFLOWS_DIR)
  if (files.length === 0) {
    console.log(`check-workflow-pins OK (workflow ファイルなし)`)
    return
  }
  const allViolations = files.flatMap(checkFile)
  if (allViolations.length === 0) {
    console.log(`check-workflow-pins OK (${files.length} workflows)`)
    return
  }
  console.error('check-workflow-pins: third-party action は commit SHA で pin する規約に違反:')
  for (const violation of allViolations) {
    console.error(`  ${violation.path}:${violation.lineNumber}  ${violation.reason}`)
  }
  console.error('')
  console.error('修正手順:')
  console.error(
    "  1. gh api repos/<org>/<repo>/git/refs/tags/<tag> --jq '.object.sha' で SHA を取得",
  )
  console.error(
    '  2. (annotated tag の場合) 同 SHA に対し /git/tags/<sha> を再問い合わせし commit SHA を取得',
  )
  console.error('  3. workflow の uses を `<org>/<repo>@<40-hex>  # <tag>` 形式に書き換え')
  console.error('')
  console.error('first-party = "actions/*" org は例外。local action "./<path>" も除外。')
  process.exit(1)
}

main()
