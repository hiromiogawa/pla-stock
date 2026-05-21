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

### FAIL-003: SQLite UPSERT が INSERT 候補行の CHECK を衝突解決前に評価する罠を spec/plan/code-review で見落とし (2026-05-19)

- **事象**: PR #98 (paint-mutation) で `addPaintEvent` の在庫更新を `db.insert(paintStocks).values({ count: data.delta }).onConflictDoUpdate({ set: { count: sql\`count + delta\` } })` で実装。在庫1の塗料を出庫 (delta=-1、結果 0=合法) しても「在庫が不足しています」と誤って拒否された。在庫0→-1 の正常拒否ではなく、在庫1→0 の **正当な出庫が全て失敗**。購入 (+1) は動くため「出庫/廃棄だけ落ちる」症状。ユーザーが手動検証で発見・指摘。
- **原因**:
  1. **SQLite UPSERT の制約評価順の無理解**: `INSERT ... ON CONFLICT DO UPDATE` で SQLite は **INSERT 候補行の CHECK を、ユニーク衝突検知→DO UPDATE への切替より先に評価**する。INSERT 候補 count に生 delta (出庫時 -1) を渡したため、既存行で結果が 0 になる場合でも phantom 候補 -1 が `CHECK(count>=0)` 違反 → 誤判定。「-1 は DB に保存されないから問題ないはず」という直感が SQLite 実行手順とズレていた
  2. **spec/plan で upsert + CHECK の相互作用を未検証**: 「CHECK + db.batch で atomic」までは brainstorming で詰めたが、`onConflictDoUpdate` の INSERT 候補値が CHECK 対象になる挙動を実機確認せず机上設計のまま plan 化
  3. **code-review (opus) もすり抜け**: レビューは atomicity/IDOR/parity を検証し「rollback がテスト未カバー」は指摘したが、UPSERT の CHECK 評価順という具体的 SQLite 挙動までは踏み込めず「behavior-parity: YES」と誤判定。静的レビューの限界 (実 DB 挙動は実機 smoke でないと出ない)
  4. **test 基盤なし (ADR-0001) で自動回帰が無く、手動 smoke 前提**だが、その手動 smoke を controller が実施せずユーザー任せにしていた (発見がユーザー検証まで遅延)
- **対策**:
  - **DB 書き込みを伴う mutation の spec/plan では、CHECK/UNIQUE/FK 制約と UPSERT/batch の相互作用を「実機 SQL で再現確認」する確認事項を必須化**。机上の SQL 設計を merge 前提にしない
  - **mutation PR は controller 自身がマージ前に「制約違反系の手動 smoke」を実施**してからユーザー確認に回す (ユーザー任せにしない)。特に「境界値: 在庫1→0 が通る / 0→-1 が拒否され台帳も増えない」を必須ケース化
  - **後続 kit/project mutation は同 upsert パターンを再利用予定 → 修正済パターン (INSERT 候補 count = `(既存 count or 0) + delta` の真の結果値) を踏襲**。生 delta を INSERT 候補に渡さない
  - 一般則: 「SQLite UPSERT は DO UPDATE に切り替わる前に INSERT 候補行を制約チェックする。候補値は最終結果値と一致させよ」
- **反映先**:
  - `docs/adr/0007-agent-failure-rules.md` (本エントリ)
  - `CLAUDE.md` (AI 運用ルール: mutation PR の制約 smoke 必須化を追記予定 — rule-cycle で要否判断)
  - 修正実装: `src/features/paint-stock-add/addPaintEvent.ts` (commit 112983c、PR #98 に記録)

### FAIL-004: drizzle `sqliteTable` 第3引数の deprecated 形式 (object 返却) をレビューで見落とし (2026-05-21)

- **事象**: PR #117 (project mutation) で `entities/projectPaintUse/schema.ts` を編集 (`onDelete: 'cascade'` 追加) した際、`sqliteTable` 第3引数 callback が **object を返す deprecated 形式** (`(table) => ({ pk: ... })`) のまま放置した。同形式は kit/paint schema にも以前から存在 (計 5 テーブル)。self-review のコード re-read でも検出できず、後日ユーザーが IDE 上の TS6387 (`非推奨です`) 警告を見て指摘。PR #119 で array 返却形式に一括移行。
- **原因**:
  1. **drizzle deprecated API の知識欠落**: `sqliteTable` 第3引数が「object 返却 → array 返却」に変わった事実を認識しておらず、`projectPaintUse` schema 編集時に既存の object-style を「既存パターン」として無批判に踏襲した (FAIL-001 と同じ「既存パターン踏襲」バイアス)
  2. **TS6387 が `check:parallel` をすり抜ける**: `tsc --noEmit` は deprecated (TS6387) を **error ではなく suggestion 扱い**にするため、`pnpm typecheck` / `check:parallel` が pass してしまう。静的層 (ADR-0009 ハーネス地図) の機械検証が deprecated を捕捉しない死角
  3. **self-review コード re-read の限界**: re-read は「差分の論理・副作用」を見る観点で、外部ライブラリの API 新旧までは射程外。レビュアー (人間/AI) が当該ライブラリの deprecation を知らないと気づけない
- **対策**:
  - 即時修正 PR #119 で全 5 テーブル (`kitStocks` / `kitEvents` / `paintStocks` / `paintEvents` / `projectPaintUse`) を array 返却形式に移行。`pnpm db:generate` の migration 差分ゼロで意味不変を証明
  - **schema / 外部ライブラリ API を編集するときは「既存パターン踏襲」で済ませず、当該 API の最新仕様 (deprecation 含む) を確認する**規律
  - deprecated の機械検出強化 (例: oxlint の `no-deprecated` 系ルール、`tsc` の deprecated を error 化する手段、editor 非依存の検出) の要否は `rule-cycle` で判断
- **反映先**:
  - `docs/adr/0007-agent-failure-rules.md` (本エントリ)
  - 修正実装: PR #119 (`entities/{kit,paint,projectPaintUse}/schema.ts`)
  - 機械検出ルールの追加要否は `rule-cycle` 経由で判断 (本エントリ追記が改善サイクルのトリガー)

## 運用メモ

- 新エントリ追加後は `failure-record` skill が指示する通り `rule-cycle` skill を呼び出す。閾値 (前回サイクル以降 3 件) 未満ならサイクルは空回りで報告のみ。
- エントリは時系列順 (FAIL-001, FAIL-002, ...) で番号は連番。
