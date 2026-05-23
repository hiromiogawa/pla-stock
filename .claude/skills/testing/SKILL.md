---
name: testing
description: Testing Trophy (Vitest + jsdom + @testing-library/react + in-memory better-sqlite3) でテストを書く規約。co-location / factory / DB integration / coverage 不採用の 9 ルールを操作可能形式で定める. Use when 新規 test file (*.test.ts / *.test.tsx) を作成するとき、または既存 test を更新するとき
metadata:
  kind: atomic
  trigger: 新規 test file (*.test.ts / *.test.tsx) を作成するとき、または既存 test を更新するとき
---

# テスト規約

## 起動規律

新規 test file を作成する **前** に Skill ツールで本 skill を invoke する (task 化必須)。本 skill の内容が context に表示された = 起動された証跡。「test の書き方は把握している」「軽微な変更だから略式で OK」は省略合理化のサイン。

## 採用ソース（一次ソース）

| 判断領域 | 一次ソース |
|---|---|
| Testing Trophy (pattern) | Kent C. Dodds — https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications |
| Vitest | https://vitest.dev/ |
| jsdom | https://github.com/jsdom/jsdom + Vitest env: https://vitest.dev/config/#environment |
| @testing-library/react | https://testing-library.com/docs/react-testing-library/intro/ |
| Selector 優先順位 | https://testing-library.com/docs/queries/about#priority |
| In-memory SQLite | https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options + https://orm.drizzle.team/docs/get-started-sqlite |
| Factory pattern | factory_bot: https://github.com/thoughtbot/factory_bot / fishery: https://github.com/thoughtbot/fishery |
| Co-location | Kent C. Dodds: https://kentcdodds.com/blog/colocation |
| Coverage を gate にしない (参考値計測は許容) | Kent C. Dodds (Trophy 原典) + Martin Fowler "TestCoverage": https://martinfowler.com/bliki/TestCoverage.html — 両者とも **閾値 gate にするな / 主要メトリックにするな** が論旨。計測自体は否定していない |

## ルール (操作可能、判断を要求しない)

### ルール 1: テストは co-located

- `foo.ts` ↔ `foo.test.ts` を同一ディレクトリに置く
- 共有 utility は `src/test-utils/` 配下のみ
- `*.test.ts` / `*.test.tsx` 以外のファイルから `src/test-utils/**` を import 禁止 (dependency-cruiser `no-test-utils-from-production` で機械強制)

### ルール 2: Unit テストを必ず併設する対象 (漏れなく)

以下を追加・変更したら対応する `*.test.ts` を必ず同ディレクトリに併設する:

- `src/features/*/schemas.ts` の `*Input` Zod schema export
- `src/entities/*/model.ts` の export 派生関数 (label map / 値リスト変換 / 計算)
- `src/features/*/*ToDb.ts` の export 関数のうち、引数→戻り値が DB に触れない純粋部分
- 上記以外の `src/features/*/` `src/shared/lib/*/` 内の export 関数で **条件分岐を持つ純粋関数**

**機械強制**: `pnpm check:test-coverage` (CI matrix の `test-coverage` job、strict モード = 違反 1 件以上で CI fail)。`src/features/*/schemas.ts` の `*Input` Zod export と `*/*ToDb.ts` の併設は script で検出 (`src/entities/*/model.ts` 派生関数 / 純粋関数判定は機械化困難なため人間レビューで補完)。

### ルール 3: Integration テストを必ず併設する対象 (漏れなく)

- `src/views/*/use*.ts` の hook export
- `src/features/*/*ToDb.ts` の export 関数 (in-memory DB で全エラーパスを含めて)
- Zod schema を持つ form の submit フロー

**機械強制**: `pnpm check:test-coverage` (CI matrix の `test-coverage` job、strict モード = 違反 1 件以上で CI fail)。`src/views/*/use*.ts` と `*/*ToDb.ts` の併設は script で検出 (form submit フローの統合判定は機械化困難なため人間レビューで補完)。

### ルール 4: テストを書かない対象 (漏れなく排除)

- `*View.tsx` / `*Form.tsx` / `*Dialog.tsx` 等の Presenter component (integration が間接的に覆う)
- `index.ts` の barrel re-export だけのファイル
- `*.gen.ts` の auto-generated
- 型定義のみ (`*.d.ts`)

### ルール 5: Selector は role-based first

- `getByRole`, `getByLabel`, `getByText` を最優先
- それで取れない箇所のみ `data-testid` を escape hatch として許可
- CSS / xpath / MUI クラス名は禁止

### ルール 6: Factory パターン強制

- fixture は `src/test-utils/factories/<entity>.ts` の `createTest<Entity>(overrides)` 経由で生成
- test 内で全フィールドを inline で書くのを禁止 (overrides で差分のみ指定)

### ルール 7: vi.mock のスコープ

- hook test では server fn / mutation module (`~/features/*/`) と TanStack Router (`@tanstack/react-router`) のみ vi.mock 可
- entity model / schema (`~/entities/*/`) は vi.mock 禁止 (純粋なので実物を使う)

### ルール 8: DB integration テストのセットアップ

- 各 test の `beforeEach` で `createTestDb()` を呼んで fresh in-memory DB を作る
- 既存の `createTestDb` を使わず raw `new Database(...)` するのを禁止
- raw SQL を test 内に書かない (Drizzle 経由)

### ルール 9: coverage は閾値 gate にせず、数字のためのテストを書かない

- **coverage を CI 閾値 gate に採用禁止** (threshold 設定禁止、PR を coverage 数値で reject しない)
- **「coverage 数値のため」のテストを追加禁止** (1 行カバーするためだけの assertion-less test 等)
- 計測自体は OK: `@vitest/coverage-v8` での計測 / PR comment への参考値表示 / 「触った箇所に test が無いかのヒント」としての利用は許容
- 採用根拠: Kent C. Dodds "Testing Trophy" + Martin Fowler "TestCoverage" — 両者とも **閾値 gate にするな / 主要メトリックにするな** が論旨で、計測自体を禁じてはいない

## test 実行 layer (どこで何が走るか)

| Layer | 何が走る | 失敗時 |
|---|---|---|
| `pre-commit` | `check:parallel` (typecheck / depcruise / knip / harness / deprecated / workflow-pins / **test-coverage**)、test 本体は含まない | commit reject |
| `pre-push` | `pnpm test` (Vitest、約 2 秒) → `pnpm build` (vite + tsc、約 30-60 秒) → verify:ui (UI 変更時) | push reject |
| CI matrix | 上記全部 + `lint` / `format` / `lint:deprecated` を独立 job (約 10 job 並列) | PR check fail |

設計意図:
- `pre-commit`: 頻度高い・軽量 gate (摩擦最小化、test 本体は遅延なくても許容)
- `pre-push`: 重め gate (push 前検出で CI fail による手戻り防止)
- CI matrix: 最後の砦、fail-fast: false で全 job を完走させ「lint が落ちたから他が見えない」を防ぐ

## プロジェクト固有運用 (textbook 外と明示)

- AI UI review (screenshot を AI が画像認識でレビュー) — #109 で実装、emerging practice。本 skill では言及のみ
- mutation server fn (`src/features/*/addXxx.ts` 等) は `*ToDb.ts` ファイルに pure 関数を抽出する。production の server fn は薄い wrapper として残す (auth / env / DB 取得のみ)。test では `*ToDb` を直接 in-memory DB と共に呼ぶ

## よくある間違い

| 言い訳 | 実態 |
|---|---|
| 「軽微なテストだから skill 起動不要」 | skill 起動で checklist と起動証跡が残る。手作業は省略が混入する |
| 「`vi.mock` で entity も差し替えれば早い」 | entity model は純粋。実物を使う方が drift しない。ルール 7 違反 |
| 「coverage 数字が低いから追加 test を」 | ルール 9 違反。閾値 gate にしない方針なので「数字を上げるためだけ」の test を書く理由はない (計測は OK、参考値として「触った箇所に test が無い」シグナルに使う) |
| 「factory を作るのが面倒だから inline」 | ルール 6 違反。factory を経由しないと共有不能 |
| 「raw SQL の方が早い」 | ルール 8 違反。Drizzle 経由でないと schema 変更追随が壊れる |
