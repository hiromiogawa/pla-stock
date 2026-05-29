---
description: UI ファイル編集時の規律 (FAIL-000b / 000c 防御)
paths:
  - "src/views/**/*.tsx"
  - "src/views/**/*.css"
  - "src/views/**/*.scss"
  - "src/widgets/**/*.tsx"
  - "src/widgets/**/*.css"
  - "src/widgets/**/*.scss"
  - "src/theme/**"
  - "src/styles/**"
---

# UI 編集時の規律

UI コード変更前 (`.tsx` の styling / sx prop / 新規 component) は必ず `frontend-design` skill を invoke する。

- 特に「見た目に対する feedback」(「貧相」「派手」「狭すぎ」「変」) を受けた時、**反応的にパラメータ調整せず** skill で Design Thinking (Tone / Differentiation / Constraints) を再適用
- design 方針 (`docs/specs/2026-04-29-design-direction.md`) と skill (craft 適用ガイド) の両方必須

UI 変更の push は機械強制で `pnpm verify:ui` 必須 (`.husky/pre-push` が以下を検出時、`.playwright-snapshots/` の鮮度をチェックして reject):

- `src/(views|widgets)/**/*.{tsx,css,scss}` (Presenter / style、hook の `.ts` や test は対象外)
- `src/(theme|styles)/**` (design token / global style)
- 撮った screenshot を **controller 自身が必ず目視確認** (run しただけで OK は禁止)

## `verify:ui` の限界

`verify:ui の OK = 「全画面 OK」ではない`。

**現状の制約**: verify:ui は **LandingView (`/`) のみ対象**。Clerk 認証 gate 配下 (`/dashboard` 等) は screenshot 不可 (Issue #109 で対応中、`@clerk/testing` で 9 routes 拡張予定)。

**依然 scope 外** (#109 完了後も continue): dialog open 状態 (購入ダイアログ等) / interaction 後の遷移 / フォーム入力状態。これらは **controller がブラウザで目視確認** するか **user の screenshot を待つ**。LandingView だけで OK 判定するのは 2026-04-29 の失敗 (ADR-0007 FAIL-000b) と同じ過ち。

## 関連

- `docs/rules/ui-patterns.md` (UI design 知識 SSoT)
- `docs/rules/architecture.md` (Container/Hook/Presenter)
- ADR-0007 FAIL-000b / FAIL-000c (UI verify 失敗事例)
- ADR-0024 (本 rule の起源、`.claude/rules/` 採用判断)
