---
name: testing
description: Testing Trophy (Vitest + jsdom + @testing-library/react + in-memory better-sqlite3) でテストを書く規約を docs/rules/testing.md から参照して適用する. Use when 新規 test file (*.test.ts / *.test.tsx) を作成するとき、または既存 test を更新するとき
---

# テスト

orchestration only。規約本文 (Testing Trophy + 9 ルール + 実装例) は `docs/rules/testing.md` を参照。

## 起動規律

新規 test file を作成する **前** に Skill ツールで本 skill を invoke する (task 化必須)。本 skill の内容が context に表示された = 起動された証跡。「test の書き方は把握している」「軽微な変更だから略式で OK」は省略合理化のサイン。

## 実行フロー

1. `docs/rules/testing.md` を読む
2. ルール 1-9 (co-location / factory / DB integration / coverage 不採用 等) を適用
3. test data は `src/test-utils/factories/<entity>.ts` の `createTest<Entity>(overrides)` 経由
4. DB integration は `createTestDb()` で fresh in-memory DB、`beforeEach` で生成
5. mutation の境界ケース (在庫 1→0 成功 / 0→-1 拒否) は必須 (FAIL-003、ADR-0007)
6. Selector は role-based first (`getByRole` / `getByLabel` / `getByText`)

## 機械強制

- `pnpm check:test-coverage` (`scripts/check-test-coverage.mjs --strict`): ルール 2/3 対象に `*.test.{ts,tsx}` 併設があるか検証
- vitest config の `coverage.thresholds.branches: 70` で C1 gate (pre-push + CI、ADR-0017)

## よくある間違い

- skill 起動せず手作業 → 起動証跡が残らず checklist が漏れる
- `vi.mock` で entity を差し替え → ルール 7 違反、entity は純粋なので実物を使う
- coverage 数字のためのテスト追加 → ルール 9 違反、計測は OK だが数字最大化目的の test は NG
- factory なしで inline data → ルール 6 違反、共有不能
- raw SQL を test 内に書く → ルール 8 違反、Drizzle 経由必須

詳細は [docs/rules/testing.md](../../../docs/rules/testing.md)。

## 参照

- 規約本文: [docs/rules/testing.md](../../../docs/rules/testing.md)
- 設計経緯: ADR-0016 (Testing Trophy)、ADR-0017 (C1 70% gate)
- factory 実装: `src/test-utils/factories/`
- 機械強制: `scripts/check-test-coverage.mjs`、`vitest.config.ts`
