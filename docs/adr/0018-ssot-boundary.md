# ADR-0018: SSoT 境界規約 (docs/rules/ を ground truth とし skill / CLAUDE.md は参照する)

- ステータス: 承認
- 日付: 2026-05-26
- 関連: Issue #111、ADR-0007 (FAIL log)、ADR-0009 (memory ルール)

## 文脈

> 本 ADR は v1 (9 SSoT 分散モデル、Issue #111 PR の commit 1 で記録) を、同 PR の議論進化を受けて v2 (docs/rules/ ground truth モデル) に PR 内で改稿したもの。PR 外部 push 前の改稿のため supersede ではなく直接更新の扱い。

pla-stock のドキュメント / 設定 / 記憶は複数の SSoT に分散していた。ADR-0009 で「設計判断は ADR、それ以外は file memory」までは確定したが、以下の問題が残った:

- **人間 + AI 共通の現状規約集約が存在しない**: `docs/` に ADR (時系列の決定ログ) と `docs/specs/` (仕様 1 件のみ) しかなく、新規 contributor が「FSD レイヤーの責務は?」「コミット規約は?」と聞いた時に読む現状規約 view が欠落
- **CLAUDE.md がコード規約・コマンド表・スタック説明等の規約本文まで抱え込んで肥大化** (346 行)、AI session context を圧迫
- **CLAUDE.md / skill / lint-config / docs が同じ規約を別々に書く二重保守**
- **skill が AI 固有の手順と規約本文を混在**: 規約変更時に複数 SSoT を更新する負担、skill ごとに規約スタイルが分散

## 決定

### 全体方針: docs/rules/ を ground truth とし、skill / CLAUDE.md は参照する

新規 `docs/rules/` を **現状の運用手順・アーキテクチャ・規約の SSoT** として導入し、人間 + AI 両方が読む。ADR は **設計判断の歴史と最終決定** を記録する役割に絞り、skill は **orchestration only** で規約本文を持たない。

### 役割分担

| 構成要素 | 役割 | 読み手 |
|---|---|---|
| **`docs/rules/`** | **現状の運用手順・アーキテクチャ・規約 (topic-based、SSoT)** | 人間 + AI + skill |
| `docs/adr/` | 設計判断の歴史 + 最終決定 (不変、追記のみ) | 人間 + AI |
| `docs/adr/0007-agent-failure-rules.md` | AI agent 失敗事例 live log | 人間 + AI |
| `docs/specs/` | ADR より動く前提の仕様 (design-direction 等) | 人間 + AI |
| `docs/harness-map.md` | ハーネス全体俯瞰 | 人間 + AI |
| **`lint-config/`** | **機械強制規約の SSoT (例外、md で表現不能)** | tooling + skill (参照) |
| `.project-config.yml` | skill 参照 enum (scope / branch prefix 等の設定値) | skill |
| **`CLAUDE.md`** | **目次 (docs/rules/ への逆引き) + AI 固有規律 (skill 起動規律 / Red Flag 等)** | AI のみ |
| **`.claude/skills/`、`.claude/agents/`、`.claude/commands/`** | **orchestration only (docs/rules/ を参照する dispatcher)** | AI |
| `docs/superpowers/` | AI 向け一過性メモ (spec / plan の途中成果物) | AI |
| file memory | session 横断 AI 内部知識 | AI |

### docs/rules/ の組織原則

**topic (= 目的) ごとに 1 ファイル**。skill mapping を意識しない。

- skill が 1 ファイルを参照することも、複数を参照することもある (skill 設計都合で決める)
- skill は orchestration only。規約本文を skill に書かない

現状想定する topic 一覧 (13 ファイル):

```
docs/rules/
├── README.md               # index + 「ADR→実装→rules 更新」workflow
├── architecture.md         # FSD レイヤー責務 + 依存ルール + Container/Hook/Presenter
├── ui-patterns.md          # Form / Toast / Loading / Emotion 隔離
├── domain-modeling.md      # Drizzle schema SSoT / entity 組織 / timestamp 種別
├── linting.md              # 型アサーション / 三項ネスト / 1 文字変数 / any 4 ルール
├── code-quality.md         # lint / format / pre-commit / CI gate
├── commit.md               # Conventional Commits / scope / header limit
├── branch.md               # branch naming / github-flow / Issue 階層 / PR↔Issue
├── issue.md                # Issue Type 別 (Epic/Task/Story/Bug/Subtask) 書き方
├── testing.md              # Testing Trophy / factory / coverage gate
├── adr-policy.md           # ADR 書き方 + 「ADR→実装→rules 更新」徹底
├── docs-policy.md          # docs/ 構造 + SSoT 境界 (本 ADR の現状形)
└── skill-authoring.md      # skill 規約 (orchestration 専念原則)
```

新規 topic 追加・既存 topic 統合は本 ADR の決定範囲外 (個別に判断)。

### 規約変更の workflow

新規規約 / 規約変更は以下の順序で必ず実施 (FAIL-002 と同種の混入リスクを下げる):

1. **ADR に記録**: 設計判断と経緯を新規 ADR (or 既存 ADR の supersede) に残す
2. **実装**: コード / lint-config / tooling 設定で実体化
3. **docs/rules/ を更新**: 現状形の規約として `docs/rules/<topic>.md` に反映 (新規 topic なら新規ファイル)

ADR 不在で docs/rules/ だけ更新するのは反パターン (経緯が失われる)。逆に ADR を書いて docs/rules/ を放置するのも反パターン (現状規約が古いまま残り、人間 / AI が古い情報を読む)。

### CLAUDE.md の役割

CLAUDE.md は以下のみを書く:

- **目次**: docs/rules/ 各ファイルへの逆引きリンク + その他 docs (adr / specs / harness-map) へのリンク
- **AI 固有規律**: skill 起動規律 (Red Flag 込み)、main 直編集禁止 (`/dev-start`)、commit 前 `/dev-complete` 必須、verify:ui 運用、subagent DONE 独立検証

CLAUDE.md にコード規約本体・コマンド表・スタック説明を書くのは反パターン (= 二重保守、肥大化原因)。

### skill / agent / command の役割

`.claude/{skills,agents,commands}/` は **orchestration only**:

- AI 判断手順 (when to invoke / how to dispatch)
- AI 向け orchestration (sub-skill 連鎖、subagent dispatch)
- 必要な docs/rules/ への参照リスト (1 つでも複数でも可)

規約本文 (例: コミット規約の詳細、testing パターン) は **docs/rules/** を参照する。例: `conventional-commits` skill は「`docs/rules/commit.md` を読んで commit message を組み立てよ」と指示する thin orchestrator。

skill 内で規約を直書きするのは反パターン。

### lint-config の例外扱い

`lint-config/` 配下の設定ファイル (oxlint / biome / dep-cruiser / commitlint / knip) は機械強制の SSoT として **md で表現不能**。docs/rules/ の該当ファイル (linting.md / code-quality.md 等) は **lint-config の人間向け説明** を書き、「機械強制実装は `lint-config/X.jsonc` を参照」とリンクする。

### 反パターン

- ADR に書ける決定を CLAUDE.md に詳細記述 (CLAUDE.md は目次 + AI 固有のみ)
- docs/rules/ に書ける規約を skill 本体に直書き (skill は orchestration only)
- ADR-0007 と別ファイルで失敗事例を記録 (ai-failures.md の再発防止)
- lint-config で機械強制している規約を docs/rules/ 本文で再記述 (docs/rules/ は「機械強制は `lint-config/X.jsonc`」と参照するのみ)
- file memory に設計判断を保存 (ADR-0009 で禁止、本 ADR で再強調)
- 規約変更で ADR を書かず docs/rules/ だけ更新 (経緯が失われる)
- 規約変更で ADR を書いて docs/rules/ を放置 (現状形が古いまま残る)

## 結果

- `docs/rules/` が新設され、人間 + AI 共通の ground truth として成立
- ADR は歴史 + 最終決定の記録に役割が絞られる
- skill は orchestration only に rewrite される (本 ADR の決定確立後、別 commit で順次実施)
- CLAUDE.md は目次 + AI 固有規律のみ (346 行 → 150 行前後想定)
- `ai-failures.md` は廃止 (ADR-0007 に統合済、同 PR の commit 3 で実施)
- 既存 ADR の supersede はしない (本 ADR は新規 boundary 規約、既存 ADR の決定内容は不変)

## 代替案

- (a) docs/rules/ を作らず CLAUDE.md に集約: 人間 onboarding に AI 向け CLAUDE.md を読ませる構造は不健全、却下
- (b) ADR を SSoT に維持し handbook を派生 view にする: 規約変更時に ADR + handbook 二重更新、却下 (本 ADR では docs/rules/ を SSoT、ADR は経緯記録に役割分担)
- (c) skill に規約本文を残す: skill が肥大化、規約変更時に skill 更新が必要、却下
- (d) `docs/rules/` の代わりに `docs/handbook/` や `docs/conventions/` の命名: 「rules」がストレートで人間 + AI 両方に伝わりやすい (議論で確定)
- (e) topic 別ではなく skill 別にファイル分割: 「skill を意識してルールを作るのは間違い」(user 指摘)、却下
- (f) 機械強制ツールで boundary 違反を検出: 「ADR に書ける内容を docs/rules/ に書いた」の機械判定は困難 (ADR と docs/rules/ の区別は内容の意図 — 経緯記録か現状規約か — に依存し、ファイルパスや構文からは機械判定不可能)、convention 運用
