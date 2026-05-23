# ADR-0016: テスト戦略 (Testing Trophy + in-memory DB + co-location + coverage 不採用)

- ステータス: 承認
- 日付: 2026-05-23
- 関連: Issue #110、FAIL-003 (ADR-0007)、ADR-0001 (Tooling)、#109 (E2E)、#148 (mock cleanup)

## 文脈

ADR-0001 で「Vitest 等 testing tool は後で導入」と保留にしていた。Phase C の mock→DB 移行が production 側で完了し、FAIL-003 (UPSERT × CHECK 境界バグ) のような実害が出た以上、基盤導入を先送りにできない。

加えて、Phase C で `addKitEvent` が D1 (`db.batch`) ベースに移行したことで、production のドメインロジックを test 環境（pure node）で再現する手段が無くなっていた。Cloudflare Workers / D1 を介さない pure node でテスト可能な形に refactor する必要があった。

## 決定

Testing Trophy パターン (Kent C. Dodds) を採用する:

- **Static**: 既存の TypeScript + oxlint + dependency-cruiser + knip (PR #157 で CI 配線済)
- **Unit**: Vitest、対象は純粋ドメイン関数のみ (Zod validator / entity 派生関数 / `*ToDb` の純粋部分 / 条件分岐を持つ純粋関数)
- **Integration (最大層)**: Vitest + jsdom + @testing-library/react + in-memory better-sqlite3 + Drizzle migrator
- **E2E (#109 別 PR)**: Playwright + @clerk/testing + storageState

採用詳細:

- 全テスト co-located (`*.test.ts` を実装ファイル直隣)
- 共有ユーティリティは `src/test-utils/` (production から import 禁止、depcruise の `no-test-utils-from-production` で機械強制)
- DB integration テストは production と同じ Drizzle migration を in-memory SQLite に適用し、CHECK / UNIQUE / FK / UPSERT 挙動を本番と等価条件で検証
- factory pattern (`createTest<Entity>(overrides)`) で fixture を生成
- **coverage は採用しない** (測定せず gate せず、`.project-config.yml` の coverage 節も削除)。Trophy の論理的帰結
- mutation server fn (`addKitEvent` 等) の DB ロジックは `*ToDb.ts` ファイルに pure 関数として抽出し、auth/env から分離する。production の server fn は薄い wrapper として残る
- 設計手順は `testing` skill、設計判断は本 ADR が SSoT
- skill 内の全ルールは「<x> なら <y>」「<a> 禁止」「<b> 必ず併設」の操作可能形式で書く (`writing-project-skills` の「操作可能ルール原則」)

## 選択肢

| 案 | メリット | デメリット |
|---|---|---|
| A: Testing Trophy (採用) | 実害ロジック (FAIL-003 系) に直接当たる、ROI 高い | 環境セットアップ初期コストあり |
| B: Pyramid (Unit 中心) | シンプル | 純粋関数しか測れず DB 境界バグを防げない |
| C: テスト導入見送り | 0 投資 | 退行を発見できず再発し続ける |
| D: coverage を gate に採用 | 業界多数派 | Trophy の主張 (coverage % は劣ったメトリック) と矛盾、ダブスタ |

## 結果

- pre-commit (matrix の `pnpm test`) と CI で test job が常時走る (#110 で CI matrix に追加)
- FAIL-003 のような境界バグは boundary integration テスト (`addKitEventToDb.test.ts`) で catch される
- coverage 数値を追わない代わりに「重要 mutation の境界条件にテストがあるか」を `testing` skill が機械的に列挙
- `addKitEventToDb` を抽出して production の auth/env から純粋関数を切り出した。production の意味論は不変 (D1 は `db.batch`、test は `db.transaction` で同じ SQL を atomic 実行、`isD1Db` type guard で分岐)
- 詳細手順は `.claude/skills/testing/SKILL.md`
- E2E (Playwright + @clerk/testing) は #109 で別 PR
- `src/entities/<x>/api/mock/*` の rename / 整理は #148 で別 PR
