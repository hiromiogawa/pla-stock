# ADR-0007: AI エージェント失敗事例とルール反映

- ステータス: 承認 (Living document — entry を追記し続ける)
- 日付: 2026-05-01 (初版)
- 関連: `failure-record` skill / `rule-cycle` skill / CLAUDE.md AI 運用ルール

## 文脈

`failure-record` skill が要求する **エージェント失敗事例の記録先** として本 ADR を運用する。各エントリは:

- **再発防止のためのルールに反映する** (CLAUDE.md / 既存 skill / 新規 skill / 他 ADR)
- **rule-cycle skill の閾値判定** (前回サイクル以降 3 件以上で改善サイクル発火) の入力になる

通常の ADR は「不変・supersede のみ」だが、本 ADR は **失敗事例ログ** という性質上 `### FAIL-NNN` を追記する live document として運用する。**過去エントリの内容は不変** (誤記訂正除く)、新エントリは末尾に追加。

> NOTE: 番号は連番だが、retro 挿入 (本 ADR 確立より前の失敗事例を後から追加する場合) は `FAIL-NNNx` (x = a/b/c) で fragment 番号化する。既存参照 (CLAUDE.md / docs / file memory) を壊さないため連番再割振りは禁止。例: `FAIL-000a/000b/000c` は ai-failures.md (2026-04-29) から本 ADR に統合した 3 件 (ADR-0018 / Issue #111)。

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

### FAIL-000a: subagent DONE 盲信による視覚崩れ (2026-04-29)

- **事象**: PR #58 (Phase β-3a, AppShell + LandingView の MUI sx 化) で `maxWidth: 168` (= 168px、本来は 672px のつもり) と書かれ、Desktop で title がタテ書き化、Tablet/Desktop でボタン縦割状態
- **原因**:
  1. subagent の DONE_WITH_CONCERNS 報告を視覚検証なしに pass
  2. HTTP 200 確認だけで PR 作成
  3. MUI sx の `maxWidth` / `width` は **px 解釈** (theme.spacing 適用なし) を controller が把握してなかった
- **対策**:
  - `.claude/settings.json` で force push 等を機械強制 (将来の事故防止)
  - CLAUDE.md `## AI 運用ルール` に「UI 変更 PR は controller 自身が Playwright screenshot 検証」明記
  - 同 spec で「subagent DONE は独立検証」明記
- **反映先**:
  - `CLAUDE.md` (AI 運用ルール節)
  - `.claude/settings.json`
- **注記**: 元は `docs/ai-failures.md` (2026-04-29) に記録、ADR-0018 (SSoT 境界規約) 確立に伴い本 ADR に統合 (2026-05-26、fragment 番号 000a)。

### FAIL-000b: ダークモード verify:ui の false positive (LandingView だけ確認) (2026-04-29)

- **事象**: PR #65 で「dark mode 動作」と claim したが実際は **LandingView 以外 (List / Detail / 認証配下全部) が light のまま**。Tailwind class (`bg-card` `border-border` 等) が dark に追従していなかった。
- **原因**:
  1. verify:ui スクリプトが LandingView (`/`) のみ対象 (= 認証 gate 配下が screenshot 不可)。LandingView は MUI sx 完全移行済で dark mode 動作 → false positive
  2. shadcn の `.dark { ... }` CSS 変数は定義済だが、 `<html class="dark">` を toggle していなかったため 1 度も活性化していなかった
  3. controller が「LandingView OK = 全画面 OK」と推定 (抽出範囲を誤った)
- **対策**:
  - 即時修正: `ThemeModeProvider` で `<html>` の class を mode 変更時に toggle
  - 構造改善: verify:ui は **LandingView の見栄えを確認する手段** であって「全画面 OK」を保証しない、と CLAUDE.md に明記
  - 認証 gate 内の visual QA は **Clerk session 込みでブラウザ目視** を controller の責務とする
- **反映先**:
  - `CLAUDE.md` (`verify:ui` 運用節)
- **注記**: 元は `docs/ai-failures.md` (2026-04-29) に記録、ADR-0018 (SSoT 境界規約) 確立に伴い本 ADR に統合 (2026-05-26、fragment 番号 000b)。

### FAIL-000c: frontend-design skill 未経由の貧相 Sidebar (2026-04-29)

- **事象**: Sidebar nav の見た目が貧相 (sparse / cheap)。padding 3px / spacing 0 / 装飾ゼロ。
- **原因**:
  1. design direction spec (`docs/specs/2026-04-29-design-direction.md`) 確定直後、「実装は skill 不要」と判断
  2. 「ミニマル」と「貧相」の区別が曖昧、 skill の "intentional restraint + craft" を経由してなかった
  3. user feedback (「nav 大きすぎ」) に **反応的に**「padding 縮める」「spacing 0」と直接調整、 設計を再考しなかった
  4. CLAUDE.md の `## AI 運用ルール` で skill invoke 規約が「UI 変更時に invoke」と曖昧で、forcing function 不在
- **対策**:
  - CLAUDE.md `## AI 運用ルール` に追記: 「UI コード変更前は必ず frontend-design skill を invoke」明文化
  - 「**見た目に対する feedback** を受けた時は反応的にパラメータ調整せず、 まず skill で Design Thinking を再適用」を強化
- **反映先**:
  - `CLAUDE.md` (AI 運用ルール節)
- **注記**: 元は `docs/ai-failures.md` (2026-04-29) に記録、ADR-0018 (SSoT 境界規約) 確立に伴い本 ADR に統合 (2026-05-26、fragment 番号 000c)。

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

### FAIL-005: View 純粋性 lint ルールが paper tiger だった (2026-05-23)

- **事象**: ユーザーから「Container/Hook/Presenter の機械強制は機能しているか」と問われ実機検証した結果、`lint-config/oxlint-view-purity.jsonc` の `no-restricted-imports` ルールが**まったく発火しない**ことが判明。`*DetailView.tsx` に `import { useState } from 'react'` を加えても oxlint がエラーを出さない。同じ `no-restricted-imports` を使う `oxlint-emotion-isolation.jsonc` は発火する一方、両者の違いは **`patterns + group` 形式 (動く) vs `paths + importNames` 形式 (動かない)**。加えて、ルールが守ろうとする mutation パスは `~/entities/kit` 等の entity 層を指していたが、実装は `~/features/kit-stock-add` 等の features 層に移っており、entity barrel は `addKitEvent` を re-export していない (paths も stale)。CLAUDE.md は当該節を「oxlint で機械強制」と記述しており、**ドキュメントが事実と乖離した状態が長期間放置**されていた。
- **原因**:
  1. **ルール導入時に「設定を書いた」で完了とし、合成違反でルールが発火することを実機検証していなかった**。oxlint 1.61 の `no-restricted-imports` は `patterns + group` は動くが `paths + importNames` は実質機能しない (または挙動が異なる) — 違反コードを 1 行書いて lint が止まることを確認すれば導入直後に気付けた
  2. **mutation の entities → features 切り出しリファクタ時に lint 設定のパス追従が漏れた**。コード側だけ動かして lint 設定の追従を忘れ、その後の lint pass を「ルールが動いている証拠」と誤読
  3. Container/Hook/Presenter pattern は TanStack Router の `useLoaderData` が **route 階層で呼ぶ前提の API** であることから、ライブラリ設計が convention を自然に誘導しており、人間レビュー + 自然な書き方で守られていた。lint は「重ねた安全網」のはずだったが、その安全網が paper だった事実が表面化しなかった (守ってない PR が出てこなかったため)
  4. **「機械強制」とドキュメントに書く時のエビデンス基準が緩い**。lint 設定の存在 = 機械強制 と認識し、合成違反テストで止まることを確認するステップが運用に組み込まれていなかった
- **対策**:
  - **新規 lint ルール導入時は『合成違反コードを 1 つ書いて lint が止めることを実機検証する』を必須化** (`code-quality` skill への追記要否は `rule-cycle` で判断)
  - **コードのレイヤー移動 (entities ↔ features 等) を伴うリファクタで関連 lint 設定のパス追従漏れがないか棚卸し**を self-review に追加検討 (`rule-cycle` で判断)
  - **CLAUDE.md コード規約 #43 の「機械強制」記述を実態に合わせて訂正**: enforcement は「TanStack Router の API 設計による自然誘導 + 人間レビュー」が主で、lint は本来の補助役だったが現状動いていない旨を明示
  - lint ルール修復は Task #155 として起票、Tier 3 (ハーネス / 品質整理) に配置
- **反映先**:
  - `docs/adr/0007-agent-failure-rules.md` (本エントリ)
  - `CLAUDE.md` (コード規約 #43 セクションの「機械強制」記述を訂正)
  - Task #155 (lint ルール再実装、別途実施)
- **2026-05-25 update (#155 部分解消 + #217 で残課題積上げ)**:
  - **`*View.tsx` → `~/features/*` 直 import** は depcruise rule `fsd-view-component-no-features-direct` で機械強制 (CI / pre-commit)、合成違反で exit 1 実機検証済
  - **react の `useState` / `useEffect` / `useReducer` 等 named import 禁止**は **review 担保** に明示転換 (custom script 案は腐敗リスクから見送り)。OSS / 別ツール検討は Issue #217 に積み上げ
  - 古い paper tiger 設定 `lint-config/oxlint-view-purity.jsonc` を削除、`.oxlintrc.json` extends からも除外
  - CLAUDE.md `Container/Hook/Presenter` 節を更新 (depcruise 強制範囲 + review 担保範囲 + Issue #217 リンクを表で明示)
- **2026-05-28 update (#217 close、ADR-0023 で OSS 採用見送り確定)**:
  - Phase A 事前調査 7 候補 (dependency-cruiser 拡張 / ESLint dual lint / eslint-plugin-boundaries / Steiger / eslint-plugin-import / TS barrel / custom script) を比較
  - 技術的に成立する選択肢は **ESLint dual lint** (`no-restricted-imports` + `importNames`) のみだったが、dual lint 設定保守コスト > paper tiger 継続リスクと user 判断で **見送り**
  - **review 担保継続を意識的選択として明文化** (ADR-0023)、`docs/rules/architecture.md` の表記も「Issue #217 で検討中」→「ADR-0023 で見送り確定」に更新
  - 将来再評価トリガー (ADR-0023 に記載): oxlint が paths+importNames を正式 support / Steiger GA / review で見落とし複数発生 / eslint 採用判断変化、のいずれか

### FAIL-006: testing skill ルール 2/3 を機械強制せず paper tiger を再発 (2026-05-23)

- **事象**: PR #159 (#110 testing 基盤導入) で `testing` skill にルール 2 (Unit test 併設対象) / ルール 3 (Integration test 併設対象) を明文化したが、対象の併設有無を検証する機械強制スクリプト (`check:test-coverage` 相当) を同 PR に含めなかった。結果、PR マージ後の確認で **12 ファイル分のルール 2/3 対象が test 未対応** のまま放置されていることが判明 (ユーザー指摘)。さらにルール側にも「`pnpm test` は書かれた test を実行するだけで、未着手は detect できない」という構造的欠陥が放置されていた。FAIL-005 と同型の paper tiger を **同日内に** 再発させた。
- **原因**:
  1. **「ルール記述 = 機械強制」と無意識に錯覚した**。skill にルール 2/3 を明文化した時点で「強制されている」と扱ってしまった (FAIL-005 で警告された認知バイアスの再発)
  2. **scope creep 自制が過剰**。#110 を「Trophy 基盤 + 例題 3 件 + skill 記述」に絞り、対応する機械強制スクリプト (check:test-coverage) を「別 task」と判断したが、ルール導入と機械強制は不可分で本来同梱必須だった
  3. **skill 起動による human (AI agent) discipline 依存**。`testing` skill を invoke すれば test を書く、という前提に頼った設計そのものが paper tiger の構造
  4. **既存 paper tiger 学習の活用漏れ**。同日中に FAIL-005 を ADR-0007 に記録したにもかかわらず、同じ落とし穴を見抜けなかった
- **対策**:
  - **`writing-project-skills` SKILL.md に「機械強制併設原則」セクションを追加**:
    - 「機械強制」と書く時の必須チェック (合成違反テスト / CI or pre-commit hook 配線 / ルール導入と機械強制スクリプトの同 PR 実装)
    - 機械強制不可能なルールは「convention 運用」「人間判断」と明示
  - **`self-review` SKILL.md の re-read 観点に「paper tiger チェック」を追加**:
    - 本 PR で「機械強制」と書いた場所があれば、合成違反で実機検証したか
    - 機械強制スクリプトが本 PR に含まれているか
    - FAIL-005 / FAIL-006 と同型の paper tiger を作っていないか
  - **#173 (check:test-coverage 実装)** を起票、testing 規約の paper tiger を機械強制化
  - **#172 (testing 横展開、12 ファイル分の test 追加)** を起票、ルール 2/3 の対象を埋める
  - **棚卸し実施**: 「機械強制」と謳う全箇所を grep で抽出し、各々の実機強制有無を判定。新規 paper tiger は発見なし、既知の 2 件 (#155 / #173) のみ
- **反映先**:
  - `docs/adr/0007-agent-failure-rules.md` (本エントリ)
  - `.claude/skills/writing-project-skills/SKILL.md` (「機械強制併設原則」セクション追加)
  - `.claude/skills/self-review/SKILL.md` (re-read 観点に「paper tiger チェック」追加)
  - Issue #174 (本対策 PR の追跡)、#173 (具体的機械強制実装)、#172 (test 横展開)

## 運用メモ

- 新エントリ追加後は `failure-record` skill が指示する通り `rule-cycle` skill を呼び出す。閾値 (前回サイクル以降 3 件) 未満ならサイクルは空回りで報告のみ。
- エントリは時系列順 (FAIL-001, FAIL-002, ...) で番号は連番。
