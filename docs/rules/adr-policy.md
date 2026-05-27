# adr-policy

pla-stock の ADR (Architecture Decision Record) 書き方・運用規約。

## ADR の位置づけ

- **設計判断の歴史 + 最終決定の記録** (不変、追記のみ)
- 現状の規約 = `docs/rules/` (本 rules)、ADR は経緯
- ADR は読み手が「なぜそうなったか」を追える形にする (動機 / 代替案 / 却下理由を必ず書く)

設計判断の SSoT は ADR (ADR-0009 で確定)。memory への二重保存はしない。

## 配置

```
docs/adr/
├── README.md                       # ADR 索引 (gen:adr-index で自動生成、手動編集禁止)
├── 0001-tooling.md
├── 0002-mui-emotion.md
├── (...)
└── NNNN-<topic>.md                 # 命名: 4 桁連番 + kebab-case topic
```

## フォーマット (テンプレート)

```markdown
# ADR-NNNN: <タイトル>

- ステータス: 承認 (or Draft / Superseded by ADR-XXXX)
- 日付: YYYY-MM-DD
- 関連: Issue #NNN、PR #NNN、他 ADR (関連リンク)

## 文脈

なぜこの判断が必要になったか (背景 / 問題)。

## 決定

何を決めたか (具体的に、リストや表で)。

## 結果

決定により何が変わるか (期待される効果、副作用)。

## 代替案

検討した他の選択肢と却下理由 (重要、後から経緯を追える形に)。
```

## 不変原則

- 過去 ADR の **内容変更は禁止** (誤記訂正除く)
- 決定が変わった場合は **新 ADR を起票して旧 ADR を Supersede**
  - 旧 ADR のステータスを `Superseded by ADR-XXXX` に更新 (これは「内容変更」の例外として許容)
  - 新 ADR の「文脈」で何を superseded したか明示
- 例外: ADR-0007 (FAIL log) は live document、`### FAIL-NNN` 追記可。retro 挿入は fragment 番号 (`FAIL-NNNx`)

## 「ADR → 実装 → docs/rules/ 更新」徹底 (ADR-0018)

新規規約 / 規約変更は以下の順で必ず実施:

1. **ADR に記録**: 設計判断と経緯を新規 ADR (or 既存 ADR の supersede) に残す
2. **実装**: コード / lint-config / tooling 設定で実体化
3. **docs/rules/ 更新**: 現状形の規約として該当 topic ファイルに反映 (新規 topic なら新規ファイル)

反パターン:

- ADR 不在で docs/rules/ だけ更新 (経緯が失われる)
- ADR を書いて docs/rules/ を放置 (現状形が古いまま残り、人間 / AI が古い情報を読む)

## ADR 索引

`docs/adr/README.md` は **`scripts/gen-adr-index.mjs` で自動生成** (手動編集禁止)。新規 ADR 追加後は `pnpm gen:adr-index` で再生成。

`pnpm gen:adr-index --check` で drift 検出 (pre-push hook で機械強制)。

## ADR-0007 (FAIL log) 特例

通常の ADR は不変だが、`docs/adr/0007-agent-failure-rules.md` は **失敗事例ログ** という性質上 `### FAIL-NNN` 追記の live document。

- 過去 entry 不変 (誤記訂正除く)、新 entry は末尾に追加
- retro 挿入 (本 ADR 確立より前の失敗事例を後から追加) は **`FAIL-NNNx` (x = a/b/c)** で fragment 番号化、連番再割振りは禁止 (CLAUDE.md / docs / file memory からの参照を壊さないため)
- 各 entry は: 事象 / 原因 / 対策 / 反映先

新規 FAIL entry 追加は `claude-handbooks:failure-record` skill 経由 (本ファイルを読んで AI が追記)。

## 関連

- skill: `claude-handbooks:adr` (新規 ADR 書き、本ファイルを読んで実行する orchestrator)
- skill: `claude-handbooks:failure-record` (ADR-0007 への FAIL 追記)
- command: `/design-decision` (ADR 起票 orchestrator)
- 設定: `scripts/gen-adr-index.mjs`、`docs/adr/README.md` (自動生成)
- 関連 ADR: ADR-0007 (FAIL log)、ADR-0009 (memory ルール)、ADR-0018 (SSoT 境界 = 本規約の根拠)
