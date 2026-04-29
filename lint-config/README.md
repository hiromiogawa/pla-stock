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
| `oxlint-view-purity.jsonc` | oxlint | View 純粋性 (#43 Container/Hook/Presenter) | 中 |
| `biome-format.jsonc` | Biome | formatter ルール | 小 |
| `dep-cruiser-fsd.cjs` | dependency-cruiser | FSD レイヤー単方向依存 + 共通 (no-circular 等) | 中 |
| `commitlint-config.cjs` | commitlint | Conventional Commits + scope-enum | 小 |

### knip だけ例外

knip 6.x は `extends` 未対応 + 設定ファイル schema が strict (未知キー禁止) のため、`knip.json` を root にインライン保持。設定意図は CLAUDE.md `## Git Hooks` 配下の説明と本 README を参照。

将来 knip が `extends` を実装したら本 dir に `knip-strict.jsonc` を切り出し直す予定。

## 別 project への流用

このディレクトリを丸ごとコピーすれば同水準の lint 環境が立ち上がる。  
project 固有の知識 (FSD レイヤー名 / 域 entity 名 / scope-enum) は以下のファイルに集中:

- `dep-cruiser-fsd.cjs` — `src/{shared,entities,features,widgets,views,routes}` 名に依存
- `oxlint-view-purity.jsonc` — `~/entities/{kit,paint,project}` 名に依存
- `commitlint-config.cjs` — `.project-config.yml` の scopes と同期

別 project では上記を書き換えるか、または該当 file を抜いて使う。

## 関連

- ADR-0001 (Phase B Tooling 採用)
- CLAUDE.md `## Git Hooks` / `## コード規約`
- PR #51 (#43 リファクタ)、PR #52 (View 純粋性ルール導入)
