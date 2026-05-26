# code-quality

pla-stock の lint / format / 静的解析 / pre-commit / pre-push / CI gate 構成。husky v9 + lint-staged + commitlint で導入済 (ADR-0001)。

## ツール構成

| ツール | 役割 | 設定 |
|---|---|---|
| oxlint | TS / JS 静的解析 (高速) | `.oxlintrc.json` (extends `lint-config/oxlint-base.jsonc` + `lint-config/oxlint-emotion-isolation.jsonc`) |
| Biome | format only (no-lint) | `biome.json` (extends `lint-config/biome-format.jsonc`) |
| dependency-cruiser | FSD レイヤー違反 / 循環依存検出 | `.dependency-cruiser.cjs` (extends `lint-config/dep-cruiser-fsd.cjs`) |
| knip | 未使用 export / file 検出 (strict) | `knip.json` |
| commitlint | commit message 規約検証 | `commitlint.config.cjs` (extends `lint-config/commitlint-config.cjs`) |
| husky | git hooks 管理 | `.husky/` |
| lint-staged | staged ファイルのみ処理 | `.lintstagedrc.json` |
| TypeScript | 型検査 | `tsconfig.json` |

詳細 linting ルールは [linting.md](./linting.md)。

## Git Hooks の 3 層

| Hook | 内容 | 性質 |
|---|---|---|
| `pre-commit` | `lint-staged` (oxlint --fix + biome format) → `check:parallel` (typecheck + depcruise + knip + deprecated + workflow-pins + test-coverage) — **test は含まない** | 軽量 gate、頻度高い |
| `pre-push` | `pnpm test` → `pnpm gen:adr-index --check` (docs drift gate) → `pnpm build` → (UI 変更時のみ) verify:ui snapshot 鮮度チェック | 重め gate、push 前検出 |
| `commit-msg` | `commitlint --edit` で Conventional Commits 検証 | message 形式 (詳細 [commit.md](./commit.md)) |

## test 実行 layer の役割分担 (#195)

- **pre-commit**: test 本体は走らない (頻度に対する摩擦最小)、軽量 gate のみ
- **pre-push**: 重め gate (`pnpm test` 2 秒 + `pnpm build` 30-60 秒)、push 前検出で CI fail による手戻り防止
- **CI matrix**: pre-commit + pre-push の全部 + lint / format / lint:deprecated を独立 job、最後の砦

## 実行可能スクリプト

利用可能な pnpm スクリプト一覧は `package.json` の `scripts` セクションが SSoT。ここに重複列挙すると drift する。

確認方法: `pnpm run` (引数なしで全 script を一覧表示)。

特殊な運用ルール (規約として残すもの):

- **`pnpm deploy` は使えない** (pnpm builtin と衝突)。Cloudflare Workers への deploy は `pnpm run deploy` (`run` 必須、#214)
- **`pnpm install` の postinstall で `cf-typegen` が自動実行** される (Cloudflare バインディング型生成)
- Node バージョンマネージャ使用時は `nvm use` / `fnm use` / `volta pin` で `.nvmrc` に追従

## 関連

- 設計経緯: ADR-0001 (tooling 採用)、ADR-0015 (deprecated API 検出)
- 機械強制実装: `lint-config/` 配下、`.husky/`、`.lintstagedrc.json`
- 詳細 linting ルール: [linting.md](./linting.md)
- commit message 規約: [commit.md](./commit.md)
