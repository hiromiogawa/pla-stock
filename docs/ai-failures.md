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
