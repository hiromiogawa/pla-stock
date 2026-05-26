---
name: code-quality
description: OXLint/Biome/knip/dependency-cruiser を pre-commit / pre-push / CI の 3 層で運用する規約を docs/rules/code-quality.md から参照して適用する。Use when 品質ツールの設定・実行タイミングを決めるとき、または lint・未使用コード・依存違反エラーに遭遇したとき
---

# コード品質

orchestration only。規約本文 (ツール構成 + 3 層 hook + コマンド一覧) は `docs/rules/code-quality.md` を参照。

## 起動規律

品質ツール設定変更時 / lint・型・dep-check エラー対処時に Skill ツールで本 skill を invoke する。

## 実行フロー

1. `docs/rules/code-quality.md` を読む
2. 該当 layer (pre-commit / pre-push / CI) でどのツールが走るか把握
3. エラー対処は **根本対応** が原則:
   - lint warning → 該当ルールに従って修正、disable 必要なら理由コメント必須 ([docs/rules/linting.md](../../../docs/rules/linting.md) の例外運用)
   - knip 未使用警告 → 削除 or `knip.json` の entry 追加で正しく解消
   - depcruise 違反 → import 方向を直す (層を超えないように設計修正)
   - typecheck error → 型を直す、`any` で逃げない (linting ルール 4 違反)
4. 機械強制 hook を skip する `--no-verify` 等は **禁止** (CLAUDE.md AI 固有規律)

## 機械強制 (3 層)

- **pre-commit**: lint-staged + `check:parallel` (typecheck + depcruise + knip + deprecated + workflow-pins + test-coverage)
- **pre-push**: `pnpm test` + `gen:adr-index --check` + `pnpm build` + (UI 変更時) verify:ui
- **commit-msg**: commitlint
- **CI matrix**: 全 hook + lint / format / lint:deprecated を独立 job

## 参照

- 規約本文 (コマンド一覧含む): [docs/rules/code-quality.md](../../../docs/rules/code-quality.md)
- 詳細 linting ルール: [docs/rules/linting.md](../../../docs/rules/linting.md)
- 設計経緯: ADR-0001 (tooling 採用)、ADR-0015 (deprecated API)
- 設定実体: `lint-config/`、`.husky/`、`.lintstagedrc.json`、`biome.json`、`.oxlintrc.json`、`knip.json`、`.dependency-cruiser.cjs`
