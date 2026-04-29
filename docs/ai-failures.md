# AI Failure Log

AI agent が同種ミスを繰り返さないため、症状 / 原因 / 教訓を append-only で記録する。

各エントリは:
- **症状**: 何が起きたか
- **発見**: どう発覚したか
- **原因**: なぜ起きたか
- **再発防止**: ルール / 仕組みをどう変えたか

---

## 2026-04-29: subagent DONE 盲信による視覚崩れ

- **症状**: PR #58 (Phase β-3a, AppShell + LandingView の MUI sx 化) で `maxWidth: 168` (= 168px、本来は 672px のつもり) と書かれ、Desktop で title がタテ書き化、Tablet/Desktop でボタン縦割状態
- **発見**: ユーザーから「自分で画面確認した?」指摘
- **原因**:
  - subagent の DONE_WITH_CONCERNS 報告を視覚検証なしに pass
  - HTTP 200 確認だけで PR 作成
  - MUI sx の `maxWidth` / `width` は **px 解釈** (theme.spacing 適用なし) を controller が把握してなかった
- **再発防止**:
  - `.claude/settings.json` で force push 等を機械強制 (将来の事故防止)
  - CLAUDE.md `## AI 運用ルール` に「UI 変更 PR は controller 自身が Playwright screenshot 検証」明記
  - 同 spec で「subagent DONE は独立検証」明記

## 2026-04-29: ダークモード verify:ui の false positive (LandingView だけ確認)

- **症状**: PR #65 で「dark mode 動作」と claim したが実際は **LandingView 以外 (List / Detail / 認証配下全部) が light のまま**。Tailwind class (`bg-card` `border-border` 等) が dark に追従していなかった。
- **発見**: ユーザーから browser screenshot 提示「問題ない分けない」
- **原因**:
  - verify:ui スクリプトが LandingView (`/`) のみ対象 (= 認証 gate 配下が screenshot 不可)。LandingView は MUI sx 完全移行済で dark mode 動作 → false positive
  - shadcn の `.dark { ... }` CSS 変数は定義済だが、 `<html class="dark">` を toggle していなかったため 1 度も活性化していなかった
  - controller (= 私) が「LandingView OK = 全画面 OK」と推定 (= 抽出範囲を誤った)
- **再発防止**:
  - 即時修正: `ThemeModeProvider` で `<html>` の class を mode 変更時に toggle (= shadcn の `.dark` 変数を活性化、 1 行修正)
  - 構造改善: verify:ui で URL を増やしても認証 gate を超えられないため、現状の verify:ui は **LandingView の見栄えを確認する手段** であって「全画面 OK」を保証しない、と CLAUDE.md に明記
  - 認証 gate 内の visual QA は **Clerk session 込みでブラウザ目視 (= ユーザーまたは controller 自身)** を controller の責務とする (run しただけで OK 禁止、と前回記録した規律を再確認)

## 2026-04-29: frontend-design skill 未経由の貧相 Sidebar

- **症状**: Sidebar nav の見た目が貧相 (= sparse / cheap)。padding 3px / spacing 0 / 装飾ゼロ。
- **発見**: ユーザーから「サイドバーは貧相、skill 使ってる?」指摘
- **原因**:
  - design direction spec (`docs/specs/2026-04-29-design-direction.md`) 確定直後、「実装は skill 不要」と判断
  - 「ミニマル」と「貧相」の区別が曖昧、 skill の "intentional restraint + craft" を経由してなかった
  - user feedback (「nav 大きすぎ」) に **反応的に**「padding 縮める」「spacing 0」と直接調整、 設計を再考しなかった
  - CLAUDE.md の `## AI 運用ルール` で skill invoke 規約が「UI 変更時に invoke」と曖昧で、forcing function 不在
- **再発防止**:
  - CLAUDE.md `## AI 運用ルール` に追記:
    - 「UI コード変更前は必ず frontend-design skill を invoke」明文化
    - 「**見た目に対する feedback** を受けた時は反応的にパラメータ調整せず、 まず skill で Design Thinking を再適用」を強化
  - 本ファイル (`docs/ai-failures.md`) を新設、 同種ミスを記録蓄積
