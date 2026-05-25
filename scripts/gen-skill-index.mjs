#!/usr/bin/env node
// .claude/skills/*/SKILL.md の frontmatter から CLAUDE.md のトリガー表を生成。
// frontmatter が SSoT。--check で「生成結果 == 現 CLAUDE.md」を検証 (exit 1 if drift)。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SKILLS_DIR = '.claude/skills'
const CLAUDE_MD = 'CLAUDE.md'
const START = '<!-- gen:skill-index start -->'
const END = '<!-- gen:skill-index end -->'

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

function collectSkills() {
  const names = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  return names.map((name) => {
    const fm = parseFrontmatter(readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8'))
    return { name, ...fm }
  })
}

// rule-cycle が連鎖呼出する内部 atomic skill。トリガー表では rule-cycle (orchestrator)
// 1 行 + 集約 1 行に圧縮 (#150)。skill ファイル自体は残し単独起動の余地は維持。
const RULE_CYCLE_INTERNAL = ['rule-measure', 'rule-explore', 'rule-improve', 'rule-audit']
const isRuleCycleInternal = (name) => RULE_CYCLE_INTERNAL.includes(name)

function renderIndex(skills) {
  const orchestrators = skills.filter((skill) => skill.metadata?.kind === 'orchestrator')
  const atomics = skills.filter((skill) => skill.metadata?.kind === 'atomic')
  const lines = []
  lines.push('### トリガー表（このトリガーに該当したら即 Skill 起動）', '')
  lines.push('| トリガー | 起動する Skill | 種別 |', '|---|---|---|')
  for (const skill of skills) {
    if (isRuleCycleInternal(skill.name)) continue
    lines.push(
      `| ${skill.metadata?.trigger ?? ''} | \`${skill.name}\` | ${skill.metadata?.kind ?? '?'} |`,
    )
  }
  // 4 つの rule-* 内部 skill を 1 行に集約 (#150)。
  const ruleInternalSkills = RULE_CYCLE_INTERNAL.map((name) => `\`${name}\``).join(' / ')
  lines.push(
    `| rule-cycle が連鎖呼出する内部 skill (詳細は \`.claude/skills/rule-cycle/SKILL.md\` 参照、単独起動も可能) | ${ruleInternalSkills} | atomic (内部) |`,
  )
  lines.push('', '### オーケストレーション系（単一責務 skill を連鎖）', '')
  for (const orchestrator of orchestrators) {
    const subs = Array.isArray(orchestrator.metadata?.subskills)
      ? orchestrator.metadata.subskills.join(', ')
      : ''
    lines.push(`- **${orchestrator.name}** → ${subs}`)
  }
  lines.push('', '### 単一責務系（atomic）', '')
  lines.push(atomics.map((skill) => `\`${skill.name}\``).join(' '))
  lines.push(
    '',
    '> 実作業の主役の一部は superpowers **plugin** skill（`brainstorming` /',
    '> `writing-plans` / `subagent-driven-development` / `systematic-debugging` /',
    '> `requesting-code-review`）で、project frontmatter 管理外。plugin 参照は',
    '> orchestrator の subskills に `plugin:` 接頭辞で記す。',
  )
  return lines.join('\n')
}

function main() {
  const skills = collectSkills()
  const generated = renderIndex(skills)
  const md = readFileSync(CLAUDE_MD, 'utf8')
  const startIdx = md.indexOf(START)
  const endIdx = md.indexOf(END)
  if (startIdx === -1 || endIdx === -1) {
    console.error(`markers not found in ${CLAUDE_MD}: add ${START} / ${END}`)
    process.exit(2)
  }
  const next = md.slice(0, startIdx + START.length) + '\n' + generated + '\n' + md.slice(endIdx)
  if (process.argv.includes('--check')) {
    if (next !== md) {
      console.error('skill-index drift: run `pnpm gen:skill-index` and commit')
      process.exit(1)
    }
    console.log('skill-index OK (no drift)')
    return
  }
  writeFileSync(CLAUDE_MD, next)
  console.log('skill-index generated into CLAUDE.md')
}

main()
