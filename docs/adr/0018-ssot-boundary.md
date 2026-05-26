# ADR-0018: SSoT 境界規約 (specs / plans / memory / CLAUDE.md / lint-config / ADR の何をどこに書くか)

- ステータス: 承認
- 日付: 2026-05-26
- 関連: Issue #111、ADR-0007 (FAIL log)、ADR-0009 (memory ルール)

## 文脈

pla-stock のドキュメント / 設定 / 記憶は 9 種類の SSoT に分かれている。ADR-0009 で「設計判断は ADR、それ以外は file memory」までは確定したが、`docs/specs/` / `docs/superpowers/` / `CLAUDE.md` / `lint-config/` / `.project-config.yml` / `harness-map.md` / `ai-failures.md` の役割境界は明文化されておらず、次の二重保守が発生した:

- `CLAUDE.md` のコード規約節 (Container/Hook/Presenter / Emotion 隔離 / Domain schema / 型アサーション禁止 等) が ADR-0002 / 0008 や lint-config と内容重複
- `docs/ai-failures.md` が ADR-0007 (FAIL log) と内容重複 (前者が 2026-04-29 で停止)
- `CLAUDE.md` が 346 行に肥大化し session context を圧迫

## 決定

### 9 SSoT 分類表

| SSoT | 性質 | 寿命 | 編集者 | 何を書くか |
|---|---|---|---|---|
| ADR (`docs/adr/`) | 不変・追記のみ | 永続 | human | 設計判断 (技術選定 / アーキテクチャ / 規約) |
| lint-config (`lint-config/`) | 機械強制 | 永続 | human | 自動検証可能なコード規約 (oxlint / biome / dep-cruiser / commitlint / knip) |
| `.project-config.yml` | skill 参照 enum | 永続 | human | scope / branch prefix 等 skill が引く列挙値 |
| `CLAUDE.md` | 読み込み必須運用規律 | 永続 | human | 機械強制できず ADR にも書きづらい都度判断ルール |
| `docs/harness-map.md` | ハーネス俯瞰 | 永続 | human | 5 層 + skill/agent/command の navigate、詳細は ADR リンク |
| ADR-0007 (FAIL log) | 失敗事例追記 | 永続 (live) | human (`failure-record` skill) | AI agent 失敗事例 (再発防止策の出典) |
| `docs/specs/` | 仕様文書 (任意) | 永続 | human | ADR より動く前提の仕様 (design-direction 等) |
| `docs/superpowers/` | AI 向け一過性 | 一時 (gitignore) | AI | spec / plan の途中成果物 |
| file memory | session 横断記憶 | 永続 (private) | AI | ADR-0009 ルール準拠 |

### 判定フロー (decision tree)

新規記述時にどこに書くか迷ったらこの順で判定:

1. 機械強制可能か → **lint-config**
2. skill が enum で参照するか → **.project-config.yml**
3. 不変の設計判断か → **ADR**
4. AI agent 失敗事例か → **ADR-0007**
5. session 横断の AI 内部知識か → **file memory**
6. AI 向け一過性メモか → **docs/superpowers/**
7. ADR より動く前提の仕様か → **docs/specs/**
8. 機械強制できず毎セッション AI に読ませる運用規律か → **CLAUDE.md**
9. ハーネス全体図か → **harness-map.md**

### 反パターン (避けること)

- ADR に書ける内容を CLAUDE.md に詳細記述 (1 行 ADR リンクのみ可)
- ADR-0007 と別ファイルで失敗事例を記録 (ai-failures.md の再発防止)
- lint-config で機械強制している規約を CLAUDE.md で再記述 (規約の二重保守)
- file memory に設計判断を保存 (ADR-0009 で既に禁止、本 ADR で再強調)

## 結果

- boundary が明文化され、新規記述時の judge コストと二重保守が減る
- `CLAUDE.md` は「機械強制できず ADR にも書きづらい都度判断ルール」に絞られる
- `ai-failures.md` は廃止 (ADR-0007 に統合、同 PR の後続 commit で実施。Refs #111)
- 既存 ADR の supersede はしない (本 ADR は新規 boundary 規約、既存 ADR の決定内容は不変)

## 代替案

- (a) boundary を `harness-map.md` に書く: ハーネス図と並列で「メタ規約」がぼやけ、どちらが SSoT か不明確になる。却下
- (b) boundary 規約自体を `CLAUDE.md` に書く: 規約 SSoT 自体が CLAUDE.md なら自己参照になる。却下
- (c) 機械強制ツールで boundary 違反を検出: 「ADR に書ける内容を CLAUDE.md に書いた」の機械判定は困難 (内容判断)、convention 運用とする
