# ADR-0009: claude-memory MCP 依存廃止 → harness ファイル memory 採用

- ステータス: 承認
- 日付: 2026-05-19
- 関連: Issue #101、ADR-0007 (FAIL-003)

## 文脈

AI 運用 skill 群（memory-usage/dev-start/design-decision/rule-*）と project CLAUDE.md が claude-memory MCP に依存。実環境で MCP 未導入のためセッション横断記憶も rule-cycle の inter-step ジャーナリングも機能せず、FAIL-003 で rule-cycle が degraded 化した。harness はシステムプロンプトでファイルベース memory（`MEMORY.md` 索引 + 型別エントリ）を標準提供しており、これが使われていなかった。

## 決定

- claude-memory MCP 依存を skill 8 本 + project CLAUDE.md から除去し、harness 組み込みファイル memory に一本化
- global `~/.claude/CLAUDE.md` は **編集しない**（全プロジェクト共通設定で他に波及）。project CLAUDE.md で「本プロジェクトは MCP 不使用」と global を上書き
- `design-decision` は ADR 一本化（memory_save 撤廃。ADR が設計判断の SSoT）
- `rule-cycle` の inter-step は同一セッションのコンテキスト授受。セッション横断で残すのは cycle-meta（前回実行日 + FAIL 総数）1 エントリのみをファイル memory に

## 結果

- MCP 未導入環境でも記憶・rule-cycle が仕様通り機能
- 設計判断の二重管理（ADR + memory）が解消
- 中断中の FAIL-003 起点 rule-cycle をファイルベースで再開可能

## 代替案

- repo 管理 `docs/memory/` 新設: 公開 repo 汚染・churn・索引/形式再設計コスト。却下
- claude-memory MCP 導入: 環境依存が残り根本解決でない。却下
- global `~/.claude/CLAUDE.md` 編集: 他プロジェクトへ波及。却下（project 上書きで回避）
