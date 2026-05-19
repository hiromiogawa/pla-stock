---
name: rule-audit
description: rule-improve が起票した改善提案 Issue を精査し、承認かクローズかを判断する（改善サイクルの最終ステップ）。Use when rule-improve 直後、または `rule-improvement` ラベルの未精査 Issue があるとき
---

# ルール検証

rule-improve が起票した改善提案 Issue を精査し、妥当なものを承認、問題があるものをクローズする。

## いつ使うか

- rule-improve の直後（改善サイクルの最終ステップ）
- `rule-improvement` ラベルの未精査 Issue があるとき

## 検証手順

### 1. 未精査の Issue を取得

```
gh issue list --label "rule-improvement" --state open --json number,title,body
```

`approved` ラベルが付いていない Issue が検証対象。

### 2. 各 Issue を検証

Issue ごとに以下を確認する:

**整合性チェック**:
- 提案されたルールが既存ルールと矛盾していないか
- 既存スキルの内容を読んで確認する

**必要性チェック**:
- アーカイブ提案の場合: 直近の FAIL 履歴と照合し、本当に不要か確認
- 新規ルールの場合: 既に別のルールでカバーされていないか確認

**影響範囲チェック**:
- 1つのスキルの変更が他スキルに波及しないか
- エージェント定義の変更が依存方向ルールに影響しないか

**根拠チェック**:
- 計測データに裏付けがあるか（Measure のジャーナルと照合）
- 探索結果と整合しているか（Explore のジャーナルと照合）

### 3. 承認またはクローズ

**承認する場合**:
```
gh issue edit [NUMBER] --add-label "approved"
gh issue comment [NUMBER] --body "rule-audit: 検証OK。既存ルールとの矛盾なし、根拠十分。"
```

**クローズする場合**:
```
gh issue close [NUMBER] --comment "rule-audit: 却下。理由: [具体的な理由]"
```

却下理由の例:
- 既存ルール「X」と矛盾する
- 計測データの裏付けが不十分
- アーカイブ対象のルールが直近の失敗防止に寄与していた

### 4. サイクルメタの更新

CLAUDE.md の記憶 (file memory) ルールに従い、ファイル memory の `rule-cycle-meta` エントリを upsert する（無ければ新規作成し `MEMORY.md` 索引に 1 行追記）。フォーマット:

```markdown
---
name: rule-cycle-meta
description: rule-cycle の前回実行記録（閾値判定の基準値）
metadata:
  type: reference
---

- 前回サイクル実行日: <今日 YYYY-MM-DD>
- その時点の FAIL 総数: <grep -c '^### FAIL-' docs/adr/0007-agent-failure-rules.md の値>
- 補足: failure-record 後の rule-cycle は「現 FAIL 総数 − この値 ≥ 3」で本実行、未満は報告のみ
```

## 出力

Issue への承認（`approved` ラベル）またはクローズ（理由コメント付き）。
`rule-cycle-meta` をファイル memory に upsert してサイクル完了を記録する。
