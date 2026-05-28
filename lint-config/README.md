# lint-config/

各 linter の設定を **base + 単一責務** で物理分割した置き場。

## 基本方針

- ルートの entry (`.oxlintrc.json`, `biome.json`, `.dependency-cruiser.cjs`, `knip.json`, `commitlint.config.cjs`) は **extends だけのスケルトン**
- 実体は本ディレクトリの `<linter>-<責務>.{jsonc,cjs}` ファイル
- 各ファイルは **冒頭に総合コメント** (役割・意図・関連 PR/doc) + **各ルールに inline コメント** (なぜそうなっているか)
- AI agent / 人間どちらが開いても、1 ファイルだけで「なぜそのルールがあるか」が分かる状態を維持

## ファイル一覧

| ファイル | linter | 何を守る | 行数感 |
|---|---|---|---|
| `oxlint-base.jsonc` | oxlint | categories / plugins / 共通 rules | 小 |
| `oxlint-emotion-isolation.jsonc` | oxlint | Emotion 直接 import 禁止 (MUI v7 engine 隔離) | 小 |
| `biome-format.jsonc` | Biome | formatter ルール | 小 |
| `dep-cruiser-fsd.cjs` | dependency-cruiser | FSD レイヤー単方向依存 + Container/Hook/Presenter (#43) + 共通 | 中 |
| `commitlint-config.cjs` | commitlint | Conventional Commits + scope-enum | 小 |

> View 純粋性 (#43 Container/Hook/Presenter) のうち `*View.tsx → ~/features/*` 禁止は `dep-cruiser-fsd.cjs` の `fsd-view-component-no-features-direct` rule で機械強制。`useState` 等 named import 禁止は **review 担保** (機械強制対象外、ADR-0023 で OSS 採用見送り確定)。旧 `oxlint-view-purity.jsonc` は paths+importNames 形式が oxlint 1.61 で機能せず paper tiger だったため #155 で削除済 (FAIL-005 / ADR-0007)。

### knip だけ例外

knip 6.x は `extends` 未対応 + 設定ファイル schema が strict (未知キー禁止) のため、`knip.json` を root にインライン保持。設定意図は CLAUDE.md `## Git Hooks` 配下の説明と本 README を参照。

将来 knip が `extends` を実装したら本 dir に `knip-strict.jsonc` を切り出し直す予定。

## 別 project への流用

このディレクトリを丸ごとコピーすれば同水準の lint 環境が立ち上がる。  
project 固有の知識 (FSD レイヤー名 / 域 entity 名 / scope-enum) は以下のファイルに集中:

- `dep-cruiser-fsd.cjs` — `src/{shared,entities,features,widgets,views,routes}` 名 + `*View.tsx` 命名規約に依存
- `commitlint-config.cjs` — `.project-config.yml` の scopes と同期

別 project では上記を書き換えるか、または該当 file を抜いて使う。

## 関連

- ADR-0001 (Phase B Tooling 採用)
- CLAUDE.md `## Git Hooks` / `## コード規約`
- PR #51 (#43 リファクタ)、PR #52 (View 純粋性ルール導入)
