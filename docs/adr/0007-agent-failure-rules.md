# ADR-0007: AI エージェント失敗事例とルール反映

- ステータス: 承認 (Living document — entry を追記し続ける)
- 日付: 2026-05-01 (初版)
- 関連: `failure-record` skill / `rule-cycle` skill / CLAUDE.md AI 運用ルール

## 文脈

`failure-record` skill が要求する **エージェント失敗事例の記録先** として本 ADR を運用する。各エントリは:

- **再発防止のためのルールに反映する** (CLAUDE.md / 既存 skill / 新規 skill / 他 ADR)
- **rule-cycle skill の閾値判定** (前回サイクル以降 3 件以上で改善サイクル発火) の入力になる

通常の ADR は「不変・supersede のみ」だが、本 ADR は **失敗事例ログ** という性質上 `### FAIL-NNN` を追記する live document として運用する。**過去エントリの内容は不変** (誤記訂正除く)、新エントリは末尾に追加。

## エントリフォーマット

新規エントリは末尾に追記する。各エントリは H3 見出しで始める:

- 見出し行: `<H3> FAIL-{NNN}: {タイトル} ({YYYY-MM-DD})` (`<H3>` は `#` 3 つ)
- 本文 (箇条書き):
  - **事象**: 何が起きたか
  - **原因**: なぜ起きたか
  - **対策**: 追加したルール / 変更
  - **反映先**: どのファイルに反映したか

> NOTE: テンプレート行を literal の `### FAIL-NNN` 形式で書くと `rule-cycle` が
> `grep -c "^### FAIL-" docs/adr/0007-agent-failure-rules.md` で実エントリと一緒に
> カウントしてしまうため、テンプレートは上記の説明文形式で記述する。

## エントリ

### FAIL-001: domain enum 値を view 層で再宣言 (2026-05-01)

- **事象**: PR #78 (Issue #76) で `KitReleaseDialog` / `PaintReleaseDialog` を TanStack Form 化した際、Zod `z.enum` 用に `RELEASE_REASON_VALUES` を dialog 内に新規追加した。これにより、既存の `REASON_OPTIONS` (value+label) と合わせて **同一の値リストが 2 箇所で重複宣言** される状態になり、レビュー (#78) でユーザーから「dialog がドメイン知識を持つのは layer 違反」と指摘された。
- **原因**:
  1. `entities/kit/model.ts` / `entities/paint/model.ts` が **型のみ** export していて値リストを export していなかった (構造的原因)
  2. AI エージェントが既存 dialog の `REASON_OPTIONS` ハードコード (pre-#76 から存在) を「既存パターン」と認識し、Zod の値リストを **その隣にもう一つ追加** する選択を取った (判断ミス)
  3. CLAUDE.md / ADR にこの種の domain enum 集約規約が明文化されていなかった (規約不在)
- **対策**:
  - ADR-0005 として「Domain enum は entities/ に values + 型派生 + labels の 3 点セットで集約」を確立 (ADR-0005)
  - CLAUDE.md「コード規約 > Domain enum」節を追加 (規約の可視化)
  - cleanup Issue #80 で実装反映
- **反映先**:
  - `docs/adr/0005-domain-enum-convention.md`
  - `CLAUDE.md` (コード規約 > Domain enum 節)
  - 実装反映は別 PR (Issue #80) に分離

### FAIL-002: self-review skill を Skill tool で起動せずコマンド手打ちで代替 (2026-05-01)

- **事象**: 直近 3 PR (#77 / #78 / #81) で、commit / PR 作成前の検証として `pnpm check:parallel` / `pnpm lint` / `pnpm format` / `pnpm build` / `pnpm verify:ui` をコマンド直叩きで走らせるのみで、**`self-review` skill を Skill tool 経由で明示起動していなかった**。結果として、PR #81 で ADR-0007 のテンプレート行 (`### FAIL-NNN`) が `grep -c "^### FAIL-"` の実エントリ件数を汚染する問題を **commit 前に検出できず**、PR 作成後の `rule-cycle` 段階で初めて気づき fixup commit を要した。ユーザー指摘で発覚。
- **原因**:
  1. **「Skill tool 起動 ≠ コマンド手打ち」の認識欠落**: skill 内の検証コマンドを直接走らせれば skill 起動と等価という誤解 (まさに `self-review` skill 内の Red Flag 「Skill 起動しなくてもコマンドは走る」)
  2. **`dev-complete` を Skill tool で起動していない**: skill 内容を読んで手順を真似るモードに留まり、Skill tool 経由起動を省略。dev-complete を Skill tool 起動すれば self-review が REQUIRED SUB-SKILL として連鎖呼出される設計を活用できなかった
  3. **書き直後の「新鮮な目」喪失バイアス**: ファイル書いた直後に「ついさっき書いたから内容覚えてる」と再読省略
  4. **docs-only PR の自己軽視**: PR #81 で「docs だから検証軽くて OK」と独断、self-review re-read を完全スキップ
  5. **task は作ったが skill 起動を含めていない**: TaskCreate で `dev-complete` タスクは作ったが、その中で「Skill tool で `self-review` を起動」を独立アクションとして扱わなかった
- **対策**:
  - CLAUDE.md「AI 運用ルール」に「**`dev-complete` / `self-review` は Skill tool 起動が必須、コマンド手打ちは代替にならない**」を Red Flag 込みで明記
  - `.claude/skills/dev-complete/SKILL.md` の冒頭に「この skill の内容が context に表示された = Skill tool で起動された証跡。手順を最初から省略せず踏むこと」のガードを追加
  - 機械強制 (pre-commit hook で skill 起動証跡要求) は採用しない判断: false positive 多発 / メンテ負債化リスクが convention 維持コストを上回る
  - 本対応 PR (Issue #82) 自体で **`self-review` skill を Skill tool 経由で正規起動して実証**
- **反映先**:
  - `docs/adr/0007-agent-failure-rules.md` (本エントリ)
  - `CLAUDE.md` (AI 運用ルール節)
  - `.claude/skills/dev-complete/SKILL.md` (冒頭ガード)

## 運用メモ

- 新エントリ追加後は `failure-record` skill が指示する通り `rule-cycle` skill を呼び出す。閾値 (前回サイクル以降 3 件) 未満ならサイクルは空回りで報告のみ。
- エントリは時系列順 (FAIL-001, FAIL-002, ...) で番号は連番。
