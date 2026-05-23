# ADR-0016: テスト戦略 (Testing Trophy + in-memory DB + co-location + coverage は gate に採用しない)

- ステータス: 承認 (2026-05-23 内容更新済 — coverage 関連節を Trophy 原典の主張に揃えて修正)
- 日付: 2026-05-23
- 関連: Issue #110、FAIL-003 (ADR-0007)、ADR-0001 (Tooling)、#109 (E2E)、#148 (mock cleanup)、#198 (coverage 計測解禁)

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
- **coverage を gate (閾値) に採用しない**。Kent C. Dodds "Testing Trophy" と Martin Fowler "TestCoverage" は両者とも **「coverage 数値を主要メトリック / 閾値 gate にするな」** が論旨であり、**計測自体を禁じてはいない**。本プロジェクトはこの原典の主張に従い、coverage を CI gate (閾値) に採用せず、`@vitest/coverage-v8` 等での計測 / PR comment 等への参考値表示は許容する
- mutation server fn (`addKitEvent` 等) の DB ロジックは `*ToDb.ts` ファイルに pure 関数として抽出し、auth/env から分離する。production の server fn は薄い wrapper として残る
- 設計手順は `testing` skill、設計判断は本 ADR が SSoT
- skill 内の全ルールは「<x> なら <y>」「<a> 禁止」「<b> 必ず併設」の操作可能形式で書く (`writing-project-skills` の「操作可能ルール原則」)

## 選択肢

| 案 | メリット | デメリット |
|---|---|---|
| A: Testing Trophy (採用) | 実害ロジック (FAIL-003 系) に直接当たる、ROI 高い | 環境セットアップ初期コストあり |
| B: Pyramid (Unit 中心) | シンプル | 純粋関数しか測れず DB 境界バグを防げない |
| C: テスト導入見送り | 0 投資 | 退行を発見できず再発し続ける |
| D: coverage を gate (閾値) に採用 | 業界多数派 | Trophy / Fowler の主張 (coverage % を閾値 gate 化すると mock 漬けの低品質テストを誘発する) と矛盾 |
| E: coverage 計測自体を禁止 (初版 ADR-0016 の記述) | 「数字を追わない」を最も厳格に表現できる | Trophy 原典は計測禁止までは謳っていない。参考値としての coverage は新規 PR で「どこに test が無いか」のヒントとして有用。過剰な縛り |

## 結果

- pre-commit (matrix の `pnpm test`) と CI で test job が常時走る (#110 で CI matrix に追加)
- FAIL-003 のような境界バグは boundary integration テスト (`addKitEventToDb.test.ts`) で catch される
- coverage を閾値 gate にしない代わりに「重要 mutation の境界条件にテストがあるか」を `testing` skill が機械的に列挙 (`check:test-coverage` script、#173)
- coverage 計測 (`pnpm test:coverage`) と PR comment への参考値表示は `#198` で配線。閾値は設定せず、新規 PR で「触った箇所に test が無いか」のヒントとして使う
- `addKitEventToDb` を抽出して production の auth/env から純粋関数を切り出した。production の意味論は不変 (D1 は `db.batch`、test は `db.transaction` で同じ SQL を atomic 実行、`isD1Db` type guard で分岐)
- 詳細手順は `.claude/skills/testing/SKILL.md`
- E2E (Playwright + @clerk/testing) は #109 で別 PR
- `src/entities/<x>/api/mock/*` の rename / 整理は #148 で別 PR

## 変更履歴

- **2026-05-23**: 初版起票。"coverage 不採用 (測定せず gate せず)" と記述
- **2026-05-23 (同日 update / #198)**: coverage 関連節を Trophy 原典 (Kent C. Dodds) / Martin Fowler "TestCoverage" の主張に揃えて修正。「計測自体を禁じる」記述は両原典に根拠が無く過剰だったため撤回。**閾値 gate に採用しない方針は維持**、参考値としての計測 / PR comment 表示は許容に変更。タイトル / 決定 / 結果 / 選択肢節 (E 追加) を更新
