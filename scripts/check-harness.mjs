#!/usr/bin/env node
// ハーネス体系性 validator (#105 phase4 / #227)。違反で exit 1。
// 対象: .claude/skills/ (atomic skill) + .claude/commands/ (orchestrator slash command)
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

const SKILLS_DIR = '.claude/skills'
const COMMANDS_DIR = '.claude/commands'
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

const skillNames = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
const skills = skillNames.map((name) => ({
  name,
  source: 'skill',
  ...parseFrontmatter(readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8')),
}))

const commandFiles = readdirSync(COMMANDS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name)
const commands = commandFiles.map((file) => {
  const name = file.replace(/\.md$/, '')
  return {
    name,
    source: 'command',
    ...parseFrontmatter(readFileSync(join(COMMANDS_DIR, file), 'utf8')),
  }
})

const referableSet = new Set([...skills, ...commands].map((entry) => entry.name))

// skill 側バリデーション: kind は atomic 必須 (orchestrator は commands に移行、#227 / #188)
for (const skill of skills) {
  const kind = skill.metadata?.kind
  if (kind !== 'atomic') {
    errors.push(
      `[1] skill ${skill.name}: kind は atomic 必須 (orchestrator は commands に移行、got ${kind})`,
    )
  }
  if (!skill.metadata?.trigger) errors.push(`[4] skill ${skill.name}: trigger 必須`)
  if (skill.metadata?.subskills) {
    errors.push(`[3] skill ${skill.name}: atomic は subskills を持てない`)
  }
}

// command 側バリデーション: kind は orchestrator 必須、subskills 実在
for (const command of commands) {
  if (!command.description) {
    errors.push(`[1] command ${command.name}: description 必須`)
  }
  const kind = command.metadata?.kind
  if (kind !== 'orchestrator') {
    errors.push(`[1] command ${command.name}: kind は orchestrator 必須 (got ${kind})`)
  }
  if (!command.metadata?.trigger) errors.push(`[4] command ${command.name}: trigger 必須`)
  const subs = Array.isArray(command.metadata?.subskills) ? command.metadata.subskills : []
  if (subs.length === 0) errors.push(`[2] command ${command.name}: orchestrator は subskills 必須`)
  for (const sub of subs) {
    if (sub.startsWith('plugin:')) continue
    if (!referableSet.has(sub)) {
      errors.push(
        `[2] command ${command.name}: subskill '${sub}' が実在しない (skills / commands 双方未存在)`,
      )
    }
  }
}

const grepPattern = 'claude-memory\\|memory_search\\|memory_save\\|memory-usage'
try {
  const hit = execSync(
    `grep -rIl "${grepPattern}" .claude/skills .claude/commands CLAUDE.md 2>/dev/null || true`,
    { encoding: 'utf8' },
  ).trim()
  if (hit) errors.push(`[6] claude-memory/memory-usage 残存: ${hit.replace(/\n/g, ', ')}`)
} catch {}

if (errors.length) {
  console.error('check-harness FAILED:\n' + errors.map((error) => '  - ' + error).join('\n'))
  process.exit(1)
}
console.log(`check-harness OK (${skills.length} skills, ${commands.length} commands)`)
