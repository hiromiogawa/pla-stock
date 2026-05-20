# ADR-0011: AI 権限ポリシーのカテゴリ設計（.claude/settings.json）

- ステータス: 承認
- 日付: 2026-05-20
- 関連: Issue #113、#105（ハーネス見直し）、ADR-0007 (FAIL ルール連動)、ADR-0009（memory MCP 廃止）、CLAUDE.md AI 運用ルール節

## 文脈

`.claude/settings.json` は 23 deny + 7 ask の場当たり構成で、運用上の問題が積層していた:

- **deny と ask の境界が曖昧**: `rm -rf` の絶対パターン (deny) と汎用 `rm -rf:*` (ask) が混在し、何を deny し何を ask にするかの基準が暗黙
- **カテゴリ未整理**: destructive git / 本番 infra / secret / 大量削除 / 外部送信 / package 管理 が同一の deny 配列に混在し、エントリの所在理由が説明困難
- **destructive gh の未網羅**: `gh pr close` は ask だが `gh pr delete-branch` `gh issue delete` `gh release delete` 等が素通り
- **package 操作の不整合**: `pnpm remove` ask あり、`pnpm install <new>` は素通りで「新 lib 採用は ADR 起票必須」(CLAUDE.md AI 運用ルール) と不整合
- **read-only 系の allow 不在**: `ls` / `cat` / `git status` 等の頻出 read-only に毎回承認プロンプトが発生し効率劣化（`fewer-permission-prompts` skill の適用余地）
- **global config 不可侵が機械強制されていない**: `~/.claude/settings.json` は不可侵だが project local 側で禁止条項なし

本 ADR で `.claude/settings.json` をカテゴリ × アクションのマトリクス構造に再構成し、各エントリの存在理由を説明可能にする。

## 決定

`.claude/settings.json` の `permissions` を以下 **10 カテゴリ × {deny, ask, allow}** マトリクスで構成する。

| # | カテゴリ | アクション | 範囲 |
|---|---|---|---|
| 1 | destructive-git | deny | `git push --force*`, `git push -f`, `git push --force-with-lease`, `git push --no-verify`, `git push origin +*`, `git push origin main`, `git push origin master`, `git reset --hard`, `git clean -f*`, `git branch -D` |
| 2 | destructive-fs (絶対 root) | deny | `rm -rf /`, `rm -rf ~`, `rm -rf $HOME` |
| 3 | destructive-fs (相対) | ask | `rm -rf:*`, `rm -r:*` |
| 4 | destructive-gh | ask | `gh repo delete`, `gh release delete`, `gh pr close`, `gh pr delete-branch`, `gh issue delete` |
| 5 | secret | deny | `Edit/Write` for `.env*`, `.dev.vars*` |
| 6 | prod (Cloudflare) | deny | `wrangler deploy`, `wrangler secret put/delete`, `wrangler d1 execute * --remote`, `wrangler d1 migrations apply * --remote` |
| 7 | harness-config (global) | deny | `Edit/Write` for `/Users/ogawahiromi/.claude/**`（global skill / settings の機械保護） |
| 8 | pkg-add | ask | `pnpm add`, `pnpm install`（lockfile 復元含む全 install を ask 化。CLAUDE.md「新 lib 採用は ADR 起票必須」連動の起票プロンプト起点。`install <name>` だけを切り分ける permission rule は記述難のため広めに ask） |
| 9 | pkg-remove | ask | `pnpm remove`, `pnpm uninstall` |
| 10 | read-only | allow | pla-stock 標準の read-only verify: `pnpm lint`, `pnpm typecheck`, `pnpm knip`, `pnpm depcruise`, `pnpm format`, `pnpm check`, `pnpm check:parallel`, `pnpm check:branch`, `pnpm check:harness`（`fewer-permission-prompts` skill で生成）。`ls` / `cat` / `grep` / `find` / `git status|log|diff|branch` / `gh pr view|list|diff` / `gh issue view|list` 等は Claude Code が auto-allowed のため本リストには含めない |

### 設計原則

- **deny** = 機械的に拒否すべき不可逆操作（履歴破壊、本番影響、secret 流出、global config 改変）
- **ask** = 局所判断が必要な操作（範囲指定 rm、destructive gh、package 操作）
- **allow** = read-only または安全な開発系コマンド（承認摩擦低減）
- **global `~/.claude/**` 編集の機械保護**: project ローカル運用と global 設定の境界を明示

### 連動ポリシー

- pkg-add の ask は **CLAUDE.md AI 運用ルール「新規ライブラリ採用は ADR 起票必須」** の運用上の起票プロンプト起点として位置付ける（機械的に ADR を要求するのではなく、人間が ask を受けた時点で ADR 起票判断する）
- destructive gh の ask 網羅は **誤クローズ・誤削除の防御**（人間判断を介在させる）
- read-only allow は **`fewer-permission-prompts` skill** の生成物として運用し、頻出パターンの追加は同 skill 経由で行う

## 選択肢

| 選択肢 | メリット | デメリット |
|---|---|---|
| **A. カテゴリ × {deny,ask,allow} マトリクス（採用）** | 各エントリの所在理由が説明可能、抜け検出が容易、運用拡張時の判断が一貫 | ask 増で pkg-add 等のプロンプト摩擦増 |
| B. 現状維持（場当たり追加） | 既存運用そのまま、変更コストゼロ | 説明性低下が継続、destructive gh 抜けが残る、新 lib ADR ルールと不整合 |
| C. すべて ask 化 | 安全側に倒れる | 承認摩擦が過大、開発効率劣化、習慣化で人間判断が形骸化 |
| D. allow 中心 + 例外 deny | プロンプト摩擦最小 | 安全側に倒れず、誤操作リスク増（destructive を見逃す） |

## 結果

### 良い面

- `.claude/settings.json` の各エントリがカテゴリで説明可能になる
- destructive gh 網羅で誤 close / 誤 delete を構造的に防御
- pkg-add ask が ADR 起票プロンプトの起点として機能（CLAUDE.md ルールと整合）
- read-only allow 集約で承認プロンプト摩擦を低減
- global `~/.claude/**` 編集の機械保護が確立

### 悪い面・受容すべきコスト

- pnpm add 等で都度 ask プロンプトが出る（新 lib ADR ポリシーの実装として受容）
- relative `rm -rf:*` が ask になり、テンポラリ削除等で都度プロンプト（安全性優先で受容）
- global config 編集の deny は絶対パスでハードコードされる（マシン差異が出るが、project local 設定のため許容）

### 拡張時のルール

- 新たな許可カテゴリを足すときは本 ADR の表に追記、または supersede する新 ADR を起票
- read-only allow の追加は `fewer-permission-prompts` skill 経由
- destructive な新パターンを発見したら ADR-0007 FAIL に記録し、本 ADR に該当行を追加

## 実装ステップ

1. `update-config` skill で `.claude/settings.json` を本表に従い再構成
2. `fewer-permission-prompts` skill で read-only allow を生成
3. `docs/harness-map.md` の統制層節に「権限ポリシー (ADR-0011)」を 1 段落追記
4. `dev-complete` skill で self-review → docs-freshness → commit/PR
