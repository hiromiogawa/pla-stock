#!/usr/bin/env node
// ハーネス体系性 validator (#105 phase4)。違反で exit 1。
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const SKILLS_DIR = '.claude/skills'
const errors = []

function coerce(raw) {
  let val = raw.trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (val.startsWith('[') && val.endsWith(']')) {
    return val
      .slice(1, -1)
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean)
  }
  return val
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const fm = {}
  let inMeta = false
  for (const rawLine of match[1].split('\n')) {
    if (rawLine.trim() === '') continue
    const top = rawLine.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    const sub = rawLine.match(/^\s+([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (top) {
      const key = top[1]
      const val = top[2]
      if (key === 'metadata' && val.trim() === '') {
        fm.metadata = {}
        inMeta = true
        continue
      }
      inMeta = false
      fm[key] = coerce(val)
    } else if (inMeta && sub) {
      fm.metadata[sub[1]] = coerce(sub[2])
    }
  }
  return fm
}

const names = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
const skillSet = new Set(names)
const skills = names.map((name) => ({
  name,
  ...parseFrontmatter(readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8')),
}))

for (const skill of skills) {
  const kind = skill.metadata?.kind
  if (kind !== 'orchestrator' && kind !== 'atomic') {
    errors.push(`[1] ${skill.name}: kind は orchestrator|atomic 必須 (got ${kind})`)
  }
  if (!skill.metadata?.trigger) errors.push(`[4] ${skill.name}: trigger 必須`)
  if (kind === 'orchestrator') {
    const subs = Array.isArray(skill.metadata?.subskills) ? skill.metadata.subskills : []
    if (subs.length === 0) errors.push(`[2] ${skill.name}: orchestrator は subskills 必須`)
    for (const sub of subs) {
      if (sub.startsWith('plugin:')) continue
      if (!skillSet.has(sub)) errors.push(`[2] ${skill.name}: subskill '${sub}' が実在しない`)
    }
  } else if (kind === 'atomic') {
    if (skill.metadata?.subskills) errors.push(`[3] ${skill.name}: atomic は subskills を持てない`)
  }
}

try {
  execSync('node scripts/gen-skill-index.mjs --check', { stdio: 'pipe' })
} catch {
  errors.push('[5] skill-index drift: `pnpm gen:skill-index` して commit')
}

const grepPattern = 'claude-memory\\|memory_search\\|memory_save\\|memory-usage'
try {
  const hit = execSync(`grep -rIl "${grepPattern}" .claude/skills CLAUDE.md 2>/dev/null || true`, {
    encoding: 'utf8',
  }).trim()
  if (hit) errors.push(`[6] claude-memory/memory-usage 残存: ${hit.replace(/\n/g, ', ')}`)
} catch {}

if (errors.length) {
  console.error('check-harness FAILED:\n' + errors.map((error) => '  - ' + error).join('\n'))
  process.exit(1)
}
console.log(`check-harness OK (${skills.length} skills)`)
