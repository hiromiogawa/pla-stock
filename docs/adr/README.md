<!-- このファイルは scripts/gen-adr-index.mjs が生成する。手動編集禁止。 -->
# ADR 索引

`docs/adr/` の全 ADR 一覧。ADR 本文が SSoT で、本索引は `pnpm gen:adr-index` で再生成する。

| ADR | タイトル | ステータス | 日付 |
|---|---|---|---|
| [ADR-0001](./0001-tooling.md) | Phase B Tooling 採用 | 承認 | 2026-04-28 |
| [ADR-0002](./0002-mui-emotion.md) | shadcn + Tailwind から MUI v7 + Emotion へ移行 | 承認 | 2026-04-28 |
| [ADR-0003](./0003-tanstack-form-mui-pattern.md) | TanStack Form + MUI integration パターン | 承認 | 2026-04-27 |
| [ADR-0004](./0004-tanstack-react-virtual.md) | 一覧 view の virtualization に @tanstack/react-virtual を採用 | 承認 | 2026-04-30 |
| [ADR-0005](./0005-domain-enum-convention.md) | Domain enum 集約規約 (values + 型派生 + labels) | Superseded | 2026-05-01 |
| [ADR-0006](./0006-drizzle-d1.md) | Drizzle ORM + Cloudflare D1 採用 | 承認 | 2026-05-13 |
| [ADR-0007](./0007-agent-failure-rules.md) | AI エージェント失敗事例とルール反映 | 承認 | 2026-05-01 |
| [ADR-0008](./0008-entity-schema-ssot.md) | Drizzle schema を entity の SSoT とする (Supersedes ADR-0005) | 承認 | 2026-05-13 |
| [ADR-0009](./0009-memory-mcp-decouple.md) | claude-memory MCP 依存廃止 → harness ファイル memory 採用 | 承認 | 2026-05-19 |
| [ADR-0010](./0010-master-data-seeding.md) | マスターデータ (Kit / Paint) 投入手段の方針 | 承認 | — |
| [ADR-0011](./0011-permission-policy.md) | AI 権限ポリシーのカテゴリ設計（.claude/settings.json） | 承認 | 2026-05-20 |
| [ADR-0012](./0012-server-state-management.md) | server state は TanStack Router loader を維持する (TanStack Query 併用は見送り) | 承認 | 2026-05-21 |
| [ADR-0013](./0013-image-storage.md) | Phase D 画像ストレージ — R2 + server fn proxy + クライアント圧縮 | 承認 | 2026-05-21 |
| [ADR-0014](./0014-photo-upload-formats.md) | 写真アップロードの受け入れ形式 | 承認 | 2026-05-22 |
| [ADR-0015](./0015-deprecated-api-static-detection.md) | deprecated API の静的検出 (oxlint type-aware) | 承認 | 2026-05-22 |
| [ADR-0016](./0016-test-strategy.md) | テスト戦略 (Testing Trophy + in-memory DB + co-location + coverage は gate に採用しない) | 承認 | 2026-05-23 |
| [ADR-0017](./0017-ai-coverage-threshold.md) | 対AI coverage threshold (C1 branches 全体 >= 70%) | 承認 | 2026-05-24 |
| [ADR-0018](./0018-ssot-boundary.md) | SSoT 境界規約 (docs/rules/ を ground truth とし skill / CLAUDE.md は参照する) | 承認 | 2026-05-26 |
| [ADR-0019](./0019-view-container-hook-presenter.md) | View Container/Hook/Presenter 分離 (retroactive) | 承認 | 2026-04-29 |
| [ADR-0020](./0020-emotion-isolation.md) | Emotion 隔離方針 (6 ルール、retroactive) | 承認 | 2026-04-28 |
| [ADR-0021](./0021-linting-policy.md) | TypeScript / JS linting policy (retroactive) | 承認 | 2026-04-29 |
| [ADR-0022](./0022-claude-handbooks-plugin.md) | claude-handbooks plugin による handbook 系 skill の切り出し | 承認 | — |
| [ADR-0023](./0023-view-purity-named-import-restriction-deferred.md) | View 純粋性 named import 禁止 — OSS 採用見送り、review 担保継続 | 承認 | — |
| [ADR-0024](./0024-harness-mechanism-audit.md) | harness 機構再点検 — `.claude/rules/` 採用 + commands→skills 統一 + stakes 別 user-only 判定 | 承認 | — |
