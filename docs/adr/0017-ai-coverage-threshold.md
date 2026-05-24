# ADR-0017: 対AI coverage threshold (C1 branches 全体 >= 70%)

- ステータス: 承認
- 日付: 2026-05-24
- 関連: ADR-0016 (test strategy)、ADR-0007 (AI failure rules)、Issue #198 (計測解禁)、Issue #200/#201/#202 (test 拡充 3 件)、Issue #206 (本決定の実装)

## 文脈

ADR-0016 (2026-05-23 update) は「coverage を gate (閾値) に採用しない」と決めた。これは Testing Trophy (Kent C. Dodds) と Martin Fowler "TestCoverage" の主張 **「coverage 数値を閾値 gate にすると mock 漬けの低品質テストを誘発する」** に整合した方針だった。

しかしこの方針は **人間が「数字稼ぎテストは書かない」と自制できる前提** に立っている。本プロジェクトでは AI agent (Claude Code) が実装の主力であり、2026-05-23〜24 のセッションで以下の recurring pattern が顕在化:

- `check:test-coverage` の co-location gate (ファイル併設チェック) は通過するが、**case 数 / 境界条件 / assertion-rich が薄い** test が量産される
- 例: PR #200 着手前は `addKitEventToDb.test.ts` 3 cases のみで CHECK / FK / batch rollback の境界未カバー、`features/*/addXxx.ts` 9 個中 8 個は `*ToDb.ts` 抽出未実施で gate そのものが paper tiger 化
- self-review subagent は文体・assertion-rich 度の判定はするが **「case 数の十分性」は判定できない** ([[ai-test-shallow-pattern]] memory)

人間の自制を前提にできない以上、機械的な下限 (= threshold gate) を一部 metric に導入する判断に至った。ただし「全 metric に厳しい閾値」は ADR-0016 の懸念 (mock 漬け誘発) と paper tiger 再発リスクを再生産するため、**C1 (branches) のみに緩い下限** を引く形にとどめる。

### 数値分析 (PR #205 merged 時点)

| Metric | 全体 % | 解釈 |
|---|---|---|
| C0 (Statements) | 27.66% | 分母 6,984 のうち view rendering boilerplate (DetailView 系の MUI Dialog/Form、LandingView、AppShell、theme/tokens 等) が ~3,500 stmts 占有 |
| **C1 (Branches)** | **70.87%** | **ロジック分岐網羅の真値**。features/*ToDb は 75-88%、views/*ListView filter は 95-96%、render boilerplate (分岐少ない) は分母に大きく寄与しない |
| Lines | 27.66% | C0 と同等 |
| Functions | 47.54% | |

per-folder で見ると **logic-heavy area (features / entities / views/*ListView) はカバー厚い**、**render-heavy area (views/*DetailView / LandingView / widgets/AppShell / theme/tokens) は意図的に薄い** = Trophy の理想構造。C1 > C0 の乖離はこの構造のシグナルである。

## 決定

`vitest.config.ts` の `coverage.thresholds.branches = 70` を設定する。それ以外の metric (C0 / Lines / Functions) は閾値設定せず、引き続き PR comment への参考値表示のみ。

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json-summary', 'json', 'html'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [/* 既存 */],
  thresholds: { branches: 70 },  // 本 ADR で追加
}
```

### なぜ C1 のみ、なぜ 70%

- **C1 = "ロジック分岐網羅"** で、「条件分岐に test が当たっているか」を直接測る。view rendering の単純 JSX は分母を膨らませない (分岐が少ない) ため、`*DetailView` 等の render-heavy 領域を不当に懲罰しない
- **C0 / Lines = "実行された statement / line 数"** で、render boilerplate (MUI Dialog / Form / Stack / Box) が分母を膨らませる。閾値設定すると shallow render test で稼ぐ paper tiger を誘発するため不採用
- **Functions** = 1 関数の少なくとも 1 case で実行されたか。粒度が大雑把で意味薄い、不採用
- **70% は現状 70.87% に対し margin 0.87pp**。今後 view を増やしたとき下回るリスクは認識済 → そのときは ADR update で 65% に下げる、または「logic-heavy folder 限定」の per-folder threshold に切替を検討する (本 ADR ではまだ全体 % だけ採用)

### 何を gate しないか (明示)

- C0 / Lines / Functions の閾値: **設定しない** (ADR-0016 の主旨を維持)
- `views/*DetailView` 単体の coverage: **gate しない** (測れない領域として認識、Trophy で「テストしない」が原則)
- diff coverage (touch 行の coverage): **本 ADR では採用見送り** (vitest-coverage-report-action は対応するが、設定コストと paper tiger 誘発リスクの再評価を別 Issue でする)
- **e2e (Playwright) の coverage**: 本 ADR のスコープは **vitest 範囲 (unit + integration) のみ**。Playwright で測る e2e 経路は対象外で、別系統で扱う。e2e の動的層復旧 (Clerk 認証貫通) は Issue #109 で進行、vitest + Playwright の coverage 合算 / e2e gate 化は #109 完了後に別 ADR で検討する

## 選択肢

| 案 | メリット | デメリット | 採否 |
|---|---|---|---|
| A: C0 >= 80% 等の高い閾値 | 業界標準的、すべての code に test 強制 | 達成に必要な ~3,655 stmts は view rendering boilerplate で、shallow render test 量産 paper tiger 再発確率高い。Trophy 原典と矛盾 | ✗ |
| B: C1 のみ閾値 (本案) | ロジック分岐網羅を機械強制、render boilerplate を不当懲罰しない、Trophy 原典に整合 | margin 薄、view 追加で簡単に下回る可能性 | ✓ |
| C: per-folder threshold (features/ >= 80% 等) | logic-heavy area を厳密 gate | 設定保守コスト中、新規 folder 追加時のメンテナンス漏れリスク | △ (本 ADR では見送り、将来 C1 全体だけで足りないと判明したら採用検討) |
| D: diff coverage gate | PR で触った行のみ gate、新規 code の test 漏れに rate-limit | 設定工数あり、touch 行が render boilerplate のときに shallow test を強要する側面あり | △ (本 ADR では見送り) |
| E: 閾値なし継続 (ADR-0016 維持) | Trophy 原典に忠実 | AI 運用前提では shallow pattern 再発確実 | ✗ (#200 以降の実害で却下) |

## 結果

- `vitest.config.ts` に `coverage.thresholds.branches = 70` 設定 (本 ADR と同 PR)
- CI で `pnpm test:coverage` が threshold 違反時に exit 1 → PR を fail させる
- PR comment の coverage 参考値表示 (`davelosert/vitest-coverage-report-action`) は継続
- 今後 70% を下回る PR が出たら、選択肢:
  1. test を追加して回復
  2. ADR-0017 update で 65% 等に下げる (= 数値悪化の意思決定を ADR で残す)
  3. per-folder threshold (案 C) への切替を ADR-0018 等で別決定
- ADR-0016 の関連節は本 ADR に対して supersede 関係 (ADR-0016 の "閾値 gate に採用しない" 方針は C0/Lines/Functions については維持、C1 のみ本 ADR で例外導入)

## 変更履歴

- **2026-05-24**: 初版起票 (Issue #206)
