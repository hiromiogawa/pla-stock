---
name: writing-project-skills
description: pla-stock プロジェクトの .claude/skills/ 配下に置く skill の delta 規約（公式 skill-creator への追加ルール）を定める. Use when 新しい skill を追加・編集するとき、既存 skill を点検するとき、または description や構造に迷ったとき
---

# プロジェクト skill 規約（公式 skill-creator の delta）

このプロジェクトの `.claude/skills/` 配下に置く skill の**差分規約**のみを定義する。skill 設計の一般原則（anatomy、progressive disclosure、draft → test → eval → iterate ループ、iteration workspace、description optimizer など）はすべて公式 skill-creator に従う。ここには重複を書かない。

**REQUIRED BACKGROUND:** [anthropics/skills:skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) を先に読むこと。以下はそれを踏まえた上でのプロジェクト固有の追加規約のみ。

## description 規約（プロジェクト delta）

skill-creator は description の長さを厳密に定めないが、このプロジェクトでは [公式 Skills 仕様](https://code.claude.com/docs/ja/skills) の例に揃え、**「何をするか」「いつ使うか」の 2 部構成・250 字以内**で書く。スキルリストで短縮された際に肝心のキーワードが削られるのを防ぐため。

```yaml
---
name: skill-name
description: <動作を一文>. Use when <トリガー条件>
---
```

- 前半: skill の動作・成果物を一文で。句点（`.` または `。`）で区切る
- 後半: `Use when <トリガー条件>` でトリガー・症状・キーワードを列挙
- 公式例: `Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"`

### description アンチパターン

| NG | 理由 |
|----|------|
| `Use when ...` のみで WHAT が無い | 公式仕様違反。Claude がスキルリストから動作を推測できない |
| `A → B → C を順次実行する` だけ | ワークフロー要約のみでトリガー条件が無い |
| WHAT に「〜のオーケストレーター」だけ書く | 何をオーケストレートするか具体化する |
| 250 字超過 | スキルリスト短縮でキーワードが削られる |

## オーケストレーター規約

対象: `dev-start`, `dev-complete`, `design-decision`, `post-review`, `rule-cycle`（複数 skill を順次起動する orchestrator command。`.claude/commands/<name>.md` に配置）。`project-bootstrap` は #188 で subagent 化済 (`.claude/agents/project-bootstrap.md`)。

- 各 step を `### Step N: skill-name（役割）` の見出しで記述
- サブスキル呼び出しは `**REQUIRED SUB-SKILL:** skill-name に従い` マーカーで明示
- `## 完了条件` セクションで全 step のチェックリストを提示
- description の WHAT には「何をオーケストレートするか」を具体語で書く（例: `memory 検索 → ブランチ作成 → 仕様確認を統括する`）

## 内部連鎖 skill

`rule-measure → rule-explore → rule-improve → rule-audit` のように特定オーケストレーターからのみ起動される skill は、description に連鎖の前後関係（「rule-measure の直後」等）を明記する。呼び出し元が曖昧だと誤トリガーしやすいため。

## プロジェクト固有の参照

- `.project-config.yml` を参照する skill はパス直書きではなく「値は `.project-config.yml` を参照」と書く
- `docs/adr/`, `docs/specs/`, `docs/generated/` 等のパスはこのプロジェクトの既存構造に従う
- scope（コミット/ブランチ）: `.project-config.yml` の `scopes` フィールドを参照（例示が必要な場合は pla-stock 実値 `kit` / `paint` / `views` 等を使う）

## 作成・編集後のフロー

1. skill ファイルを作成/編集したら `CLAUDE.md` の `## Skills` セクションに 1 行ポインタを追加（または既存ポインタを更新）
2. `conventional-commits` に従い `docs(skills): add <name> skill` または `docs(skills): update <name> skill` でコミット

## 操作可能ルール原則（全 skill 共通）

本プロジェクトの全 skill のルール記述は **判断を要求する表現** を使わない。

**禁止語**: 「重要」「適切」「必要に応じて」「迷ったら」「望ましい」「適宜」「考慮する」「判断する」など。

**強制形式**:
- 「<x> の場合は <y> する」
- 「<a> は禁止」
- 「<b> を必ず併設」
- 「<c> 以外のとき <d> する」

ルール対象を**列挙して書く**（漏れなく / 漏れなく排除）。「重要なロジック」のような判断対象は **どのファイル / どの API / どの分岐** に該当するかを具体名で示す。

採用根拠: AI assist 開発で skill の挙動が判断語で揺れるのを防ぐため。判断を要する場面は呼び出し元 orchestrator skill / 上位 ADR に責任を移譲する。

既存 skill の retrofit は本原則に従って漸進的に進める (一括 retrofit は別 Issue で扱う)。

## 機械強制併設原則

skill / docs / lint-config 等に「機械強制」と書く規約は、以下を **同 PR で同時に実装** する。後追いで機械強制を別 PR / 別 task に切り出すのは **禁止**。「ルール文書を書いたが機械強制は別 task」は paper tiger を作る行為であり、過去複数回観測されている再発バイアス (「ルール記述 = 機械強制」と無意識に錯覚) を skill 規約レベルで予防する。

### 「機械強制」と書く前のチェック (必須)

- [ ] **合成違反コードを 1 行書いて lint / depcruise / script が止まる** ことを実機検証 (= 合成違反テストで red を確認、その後 cleanup)
- [ ] **CI / pre-commit hook で実際に走る配線** がある (ローカル実行コマンドだけでなく、CI workflow の matrix or git hook に組み込み済み)
- [ ] **ルール導入と機械強制スクリプトは同 PR で実装**。先にルール文書を書いて機械強制は次 PR、は禁止
- [ ] PR 本文に検証エビデンス (合成違反 → red、CI 配線箇所) を明記

### 機械強制不可能なルールの扱い

機械強制できないルール (人間判断 / convention 運用) は **「機械強制」と書かない**。代わりに以下のいずれかで明示する:

- 「convention 運用」「人間レビューで確認」と skill / docs に明記
- skill の起動規律で AI に守らせる (ただし起動忘れリスクは残る、機械強制ではない)
- 違反例があれば `failure-record` skill で記録し、別 Issue で機械強制化を起票

### 採用根拠

「ルール記述 = 機械強制」と無意識に錯覚するバイアスが繰り返し観測されている。典型パターン:

- lint 設定だけ書いて合成違反テストで実機検証を忘れ、設定が functional でないまま paper tiger 化
- skill にルールを明文化したが対応する機械強制スクリプトを別 task に切り出し、結果として未実装のまま放置

両パターンは「ルール文書 ≠ 機械強制」を明示的に意識しないと再発する。本原則のチェックリストはこの認知バイアスへの structural 対策。

## 本物 slash command (orchestrator は .claude/commands/) (#227)

明示起動の儀式が本質な orchestrator は **Claude Code 公式の slash command** として `.claude/commands/<name>.md` に配置する。AI auto-trigger は構造的に不可 (user 入力でしか起動できない)。

```yaml
---
description: <動作を一文>
argument-hint: <arg-name>       # 引数を取る場合のみ
---
```

frontmatter は Claude Code 公式形式 (`description` / `argument-hint`) のみ。`kind` / `subskills` / `trigger` 等の自己参照的 metadata は **置かない** (#232 で除去、ADR-0007 paper tiger 系)。連鎖 (orchestrator → sub-skill / subagent) は **body 中の markdown 記述が SSoT**。

### 使用判断

- **本物 slash command 化する**: 明示起動の儀式が本質な orchestrator 全般。pla-stock では `dev-start` / `dev-complete` / `post-review` / `design-decision` / `rule-cycle` の 5 つを `.claude/commands/` に配置 (#227 で本物 slash 移行)
- **skill のまま (`.claude/skills/`) 残す**: AI が状況判断で自動起動すべき判定系 (`testing` / `failure-record` / `adr` 等の handbook)
- **subagent (`.claude/agents/`) にする**: 独立 context で実行する必要があるもの (例: self-review の「新鮮な目」、rule-measure / rule-explore の独立計測、project-bootstrap の Write tool による生成)。Agent tool で dispatch。`.claude/skills/<name>/SKILL.md` を dispatch reference として併設するパターンを推奨

### 設計上の注意

- 本物 slash command の引数は body 中で `$ARGUMENTS` プレースホルダで参照可能 (Claude Code が user 入力を substitute)
- 連鎖 (orchestrator) の sub-skill / subagent 呼出は body 中で `**REQUIRED SUB-SKILL:**` / `**REQUIRED SUBAGENT:**` マーカーで明示
- AI 視点では「ユーザーに `/name` を依頼する」運用 (auto-trigger 構造的に不可なので毎回 user 入力が必要)
- skill / command 一覧は Claude Code が session 開始時 system-reminder で description を context 注入する。CLAUDE.md トリガー表生成は #227 で廃止、frontmatter 機械検証も #232 で廃止 (description が SSoT、俯瞰は #229 drawio)
