---
name: design-decision
description: 設計判断を docs/adr/ の ADR に記録するオーケストレーター（adr 一本）。Use when ライブラリ選定・DB 設計・アーキテクチャ変更など、後から理由を問われうる設計判断が brainstorming 中に発生したとき
kind: orchestrator
subskills: [adr]
trigger: ライブラリ選定・DB 設計・アーキテクチャ変更など、後から理由を問われうる設計判断が brainstorming 中に発生したとき
---

# 設計判断

設計上の重要な判断があったとき、ADR に記録する（ADR が SSoT。memory への二重記録はしない — 本プロジェクトは設計判断を ADR 一本化）。

## いつ使うか

- 技術選定、アーキテクチャ変更、アルゴリズム選択などの設計判断があったとき
- superpowers:brainstorming の中で判断が確定したとき
- 「なぜこの方法を選んだのか」を記録すべきとき

## 実行フロー

### Step 1: adr（ADR作成）

**REQUIRED SUB-SKILL:** adr に従い:

1. `docs/adr/` に新規 ADR を作成
2. コンテキスト、検討した選択肢、決定内容、理由を記録
3. ステータスは `Accepted`

ADR 番号は既存の最大番号 + 1。

> memory への保存は行わない。設計判断の検索性は git + ADR 索引（連番ファイル名 + 各 ADR 冒頭のタイトル/関連）で担保する。ADR を Supersede する場合は adr skill の規約に従う。

### 完了条件

- [ ] ADR ファイルを作成済み（docs/adr/）
- [ ] コンテキスト・選択肢・決定・理由が記録されている
- [ ] （Supersede がある場合）旧 ADR のステータス更新済み
