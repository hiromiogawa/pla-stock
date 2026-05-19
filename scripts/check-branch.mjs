#!/usr/bin/env node
// ブランチ規律 guard。引数があればそれを、無ければ現ブランチを検査。
// main/master 直、または <prefix>/#<issue>-<desc> 不一致で exit 1。
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function currentBranch() {
  return execSync('git branch --show-current', { encoding: 'utf8' }).trim()
}

function loadPrefixes() {
  const yml = readFileSync('.project-config.yml', 'utf8')
  const match = yml.match(/prefixes:\s*\[([^\]]+)\]/)
  if (!match) return ['feat', 'fix', 'refactor', 'docs', 'chore', 'test']
  return match[1].split(',').map((segment) => segment.trim()).filter(Boolean)
}

const branch = process.argv[2] ?? currentBranch()
const prefixes = loadPrefixes()

if (branch === 'main' || branch === 'master') {
  console.error(
    `branch guard: ${branch} への直接コミット禁止。` +
      `dev-start skill で feature ブランチを作成してください。`,
  )
  process.exit(1)
}

const pattern = new RegExp(`^(${prefixes.join('|')})/#[0-9]+-[a-z0-9._-]+$`)
if (!pattern.test(branch)) {
  console.error(
    `branch guard: '${branch}' が規約に不一致。` +
      `形式: <${prefixes.join('|')}>/#<issue番号>-<英小文字説明>`,
  )
  process.exit(1)
}
console.log(`branch OK: ${branch}`)
