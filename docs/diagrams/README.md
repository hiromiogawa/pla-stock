# docs/diagrams

pla-stock の構造を視覚化した drawio 図を配置するディレクトリ。

## 図一覧

| ファイル | 内容 | 関連 ADR / Issue |
|---|---|---|
| [`domain-model.drawio`](./domain-model.drawio) | ドメインモデル (kit / paint / project / project_paint_use + Clerk user) | ADR-0008 (Drizzle schema SSoT)、ADR-0006 (Drizzle + D1)、#226 |

## 閲覧方法

`.drawio` ファイルは XML 形式。以下のいずれかで閲覧 / 編集可能:

| 方法 | 手順 |
|---|---|
| **drawio.com (Web)** | <https://app.diagrams.net/> → "Open Existing Diagram" → repo の `.drawio` ファイル選択 (ローカルから or GitHub URL から) |
| **VS Code 拡張** | [`hediet.vscode-drawio`](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) をインストール → エディタ内で直接編集 |
| **drawio Desktop** | <https://github.com/jgraph/drawio-desktop> からダウンロード |

## PNG / SVG export

GitHub は `.drawio` を直接レンダリングしないため、Markdown 等から参照するには PNG / SVG に export する必要がある。

drawio.com or VS Code 拡張で開いた状態で:

- **File → Export as → PNG** (or SVG)
- 同階層 (`docs/diagrams/`) に `domain-model.svg` 等として保存

## 更新ルール

- schema (`src/entities/<x>/schema.ts`) や ADR (`docs/adr/0008-*` 等) の変更で図と乖離が生じた場合は **手動更新が必要** (docs-freshness skill の **How** カテゴリ、自動生成しない)
- 図の構造変更を伴う schema 変更を含む PR で同時に `.drawio` を更新するのが望ましい
- 更新後、PNG / SVG export を忘れず再生成する

## 関連

- skill: `docs-freshness` (手動ドキュメントとしての位置付け)
- rule: [`docs/rules/domain-modeling.md`](../rules/domain-modeling.md)
- 設計判断: ADR-0008 (entity schema SSoT)、ADR-0006 (Drizzle + D1)、ADR-0010 (master data seeding)
