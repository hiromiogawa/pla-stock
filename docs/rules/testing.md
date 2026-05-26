# testing

pla-stock のテスト戦略。Testing Trophy + co-location + in-memory DB integration + C1 70% gate。

## 採用方針

- **Testing Trophy** (Kent C. Dodds): Unit ≪ Integration ≪ E2E、Integration 中心
- **Vitest** + **jsdom** + **@testing-library/react** + **in-memory better-sqlite3** (Drizzle 経由で本物 schema 検証)
- **co-location**: `*.test.ts` / `*.test.tsx` をソースと同階層
- **factory pattern**: test data は `src/test-utils/factories/<entity>.ts` の `createTest<Entity>(overrides)` から
- **C1 (branches) coverage 全体 >= 70%** を vitest gate で機械強制 (ADR-0017)

## 9 ルール (testing skill 由来)

1. co-location: test ファイルはソースと同階層に置く
2. 純粋関数 (entity の derived getter 等) は **必ず** unit test 併設
3. server fn (mutation / loader) は **必ず** integration test (in-memory D1) 併設
4. View component は test 不要 (Container/Hook/Presenter で分離済、hook を test)
5. test data は factory 経由 (seed data は dev 専用、test 用とは別、[domain-modeling.md](./domain-modeling.md) 参照)
6. mock は最小限 (R2 / Clerk 等の external のみ)
7. integration test は real schema (in-memory better-sqlite3 + Drizzle)、mock SQL は NG
8. coverage gate は C1 (branches)、全体 >= 70%
9. test 用 stub は `src/test-utils/__stubs__/` 集約

## 機械検証

- `pnpm check:test-coverage` — ルール 2/3 対象 (entity 純粋関数 / server fn) に `*.test.{ts,tsx}` 併設があるか検証 (`scripts/check-test-coverage.mjs`)
  - script は `--strict` 固定 (= 違反は error)、pre-commit (check:parallel 内) と CI で同条件
  - warning のみ確認したい場合は `node scripts/check-test-coverage.mjs` を直接実行 (`--strict` なし)
- vitest config の `coverage.thresholds.branches: 70` で C1 gate (pre-push + CI)

## seed と test fixture の役割境界

- `src/entities/<x>/api/seed/` — **dev seed 専用データ** (production から import 禁止、depcruise `no-seed-from-production` で機械強制)
- `src/test-utils/factories/<entity>.ts` — **test 用 data factory** (`createTestKit(overrides)` 等)

混在しない。test で seed data を使うのは NG。

## test 例

### Unit test (純粋関数)

```ts
// src/entities/kit/model.test.ts
import { describe, expect, it } from 'vitest'
import { getKitStockBalance } from './model'

describe('getKitStockBalance', () => {
  it('正常系', () => {
    expect(getKitStockBalance({ events: [{ delta: 2 }, { delta: -1 }] })).toBe(1)
  })
})
```

### Integration test (server fn + in-memory D1)

```ts
// src/features/kit-mutation/api/addKitEvent.test.ts
import { describe, expect, it, beforeEach } from 'vitest'
import { createTestDb } from '~/test-utils/db'
import { createTestKit } from '~/test-utils/factories/kit'
import { addKitEventToDb } from './addKitEvent'

describe('addKitEventToDb', () => {
  let db: TestDb
  beforeEach(async () => { db = await createTestDb() })

  it('在庫 1 → 0 (出庫) は成功する (CHECK 境界)', async () => {
    const kit = await createTestKit(db, { initialStock: 1 })
    const result = await addKitEventToDb(db, { kitId: kit.id, delta: -1, reason: 'sell' })
    expect(result.ok).toBe(true)
    expect(await getKitStockBalance(db, kit.id)).toBe(0)
  })

  it('在庫 0 → -1 (出庫) は拒否、台帳も増えない (CHECK + batch rollback)', async () => {
    const kit = await createTestKit(db, { initialStock: 0 })
    const result = await addKitEventToDb(db, { kitId: kit.id, delta: -1, reason: 'sell' })
    expect(result.ok).toBe(false)
    expect(await getKitEventCount(db, kit.id)).toBe(0)
  })
})
```

mutation の境界ケース (在庫 1→0 成功 / 0→-1 拒否) は **必須** (FAIL-003 由来、ADR-0007)。

## 関連

- 設計経緯: ADR-0016 (Testing Trophy + 9 ルール)、ADR-0017 (C1 70% gate)
- skill: `testing` (本ファイルを読んで test を組み立てる orchestrator)
- 機械検証: `scripts/check-test-coverage.mjs`、vitest config の coverage threshold
- factory 実装: `src/test-utils/factories/`、stub: `src/test-utils/__stubs__/`
- 関連 issue: #195 (test layer 役割分担)、#198/#199 (coverage 計測解禁)、#200/#206 (C1 gate 化)
