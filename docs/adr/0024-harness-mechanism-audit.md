# ADR-0024: harness 機構再点検 — `.claude/rules/` 採用 + commands→skills 統一 + stakes 別 user-only 判定

## ステータス

Accepted

## コンテキスト

2026-05-29、Claude Code 公式 docs (https://code.claude.com/docs/en/memory.md, https://code.claude.com/docs/en/claude-directory.md) との突合で 2 件の事実誤認を発見:

1. **`.claude/rules/` は公式機能**だった (過去 memory `claude-code-official-features` で非公式と誤判定、user 指摘)。session 起動時に自動 context 注入、`paths:` frontmatter で path-scope 可、subdirectory 再帰探索、symlink 対応
2. **`.claude/commands/` と `.claude/skills/` は unified mechanism**、公式は「新規は skills 推奨」 — pla-stock の #227 で「本物 slash = commands」と判断した前提が変化

加えて、orchestrator stakes 別の user-only 判定 (論点 7) も同時整理する必要が表面化:

- `/dev-start` (branch 作成のみ、undo 容易) は低 stakes、user-only ゲートは過剰
- `/dev-complete` (commit + PR、irreversible) は高 stakes、user-only ゲート維持
- `/post-review` / `/design-decision` / `/rule-cycle` は中-高 stakes (commit や外部 visible Issue 起票)、user-only 維持

## 決定

hybrid 構成を採用:

- **global rules** → CLAUDE.md (常時 load、158 → ~80 行に圧縮)
- **path-scoped rules** → `.claude/rules/<topic>-discipline.md` (matching file 時のみ load) を新設。`-discipline` suffix で `docs/rules/` (知識 SSoT) と区別。本 PR では `ui-discipline.md` (UI 編集時)、`db-discipline.md` (DB schema/mutation 編集時) の 2 ファイルを起点とし、将来追加可能
- **手順** → `.claude/skills/<name>/SKILL.md` に統一 (orchestrator も atomic も同位置、公式方向追従)
- **儀式** → orchestrator skills の `disable-model-invocation` で実現、stakes 別判定:
  - `/dev-start`: `false` (AI 可、friction 削減)
  - `/dev-complete` / `/post-review` / `/design-decision` / `/rule-cycle`: `true` (user-only、FAIL-002 防御維持)
- **判断補助** → file memory (規範 layer の sub-layer)
- **知識** → docs/rules/ (SSoT) + docs/adr/ (歴史) 現状維持
- **機械強制** → settings.json + .husky + CI 現状維持

## 選択肢

| 選択肢 | 内容 | 結論 |
|---|---|---|
| **α. hybrid (本決定)** | CLAUDE.md global + `.claude/rules/` path-scope + skills 統一 + stakes 別 | **採用** |
| β. CLAUDE.md monolithic 維持 | `.claude/rules/` 不採用、全規律 CLAUDE.md に集約 | 却下 (context 効率悪、公式機能未活用) |
| γ. 全規律 `.claude/rules/` 移行 | CLAUDE.md は最小目次のみ | 却下 (global rules を path-scope に無理に押し込む、不自然) |
| δ. commands 保持 (skills 移行せず) | 公式方向に逆らうが migration コスト 0 | 却下 (long-term 保守性 ↓、stakes 別判定の機会逃す) |
| ε. 全 orchestrator AI 可 | 全 `disable-model-invocation: false` | 却下 (FAIL-002 再発リスク、ceremony 不在化) |

## 結果

### 反映先

- 新規: `.claude/rules/ui-discipline.md` / `db-discipline.md` (path-scope 規律)
- 新規: `.claude/skills/{dev-start,dev-complete,post-review,design-decision,rule-cycle}/SKILL.md` (commands から移行、stakes 別 frontmatter)
- 削除: `.claude/commands/{dev-start,dev-complete,post-review,design-decision,rule-cycle}.md` (skills に統合)
- 更新: `CLAUDE.md` (圧縮 + skills 統一に skill / command 一覧表修正)
- 更新: `docs/diagrams/harness-map.drawio` 3 page (overview 6→8 機構、orchestrator skills 統一、legend rules 追加)
- 更新: `docs/harness-map.md` (5 層 table + 機構リスト + 境界 section)
- 更新: `docs/rules/skill-authoring.md` (commands→skills 統一規約、stakes 別 `disable-model-invocation` 規約)
- 更新: `docs/adr/README.md` (gen:adr-index 自動再生成)

### Supersedes (部分)

- ADR-0011 (settings.json 権限ポリシー): skill/command 構成記述部分のみ更新、本体 (deny/ask/allow マトリクス) は維持
- ADR-0022 (claude-handbooks plugin): skills/commands 境界記述部分のみ更新、本体 (plugin 採用判断) は維持
- 過去 #227 判断 (本物 slash = commands、全 user-only 一律): skills 統一 + stakes 別判定に置換

### Mitigation

- `harness-map.drawio` (PR #238 merged) の 6 機構表示 → 8 機構に訂正、新規参加者の混乱は ADR で経緯記録 + drawio 内コメントで言及
- `/dev-start` の AI 自律起動への workflow 変化 → CLAUDE.md および `docs/rules/skill-authoring.md` で明文化

### 將來再評価トリガー

- 公式 docs で `.claude/commands/` が正式 deprecation 警告 → commands 削除を確認
- `.claude/rules/` の subdirectory 構造 (`frontend/` `backend/` 等) の活用余地 → flat → ネスト判断
- `~/.claude/rules/` (user-level) の個人 rules 活用 (user 判断、project 外)
- stakes 別判定で friction/safety バランスに不満出る場合 (`/rule-cycle` で signal 集積)

### 関連

- Issue #241 (本 ADR で対応)
- ADR-0011 / ADR-0018 / ADR-0022 (部分 Supersedes、本体維持)
- ADR-0007 FAIL-002 (orchestrator ceremony の根拠)
- 過去 PR #227 (本物 slash 化、本 ADR で skills 統一に supersede)
- 関連 公式 docs: https://code.claude.com/docs/en/memory.md, https://code.claude.com/docs/en/claude-directory.md
- 関連 memory: `claude-code-official-features` (本 audit 着手前に AI が訂正済)
