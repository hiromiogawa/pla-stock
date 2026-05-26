# docs-policy

pla-stock の docs/ 構造 + SSoT 境界規約。ADR-0018 の現状形要約 (本 rules の存在根拠)。

## docs/ 構造

```
docs/
├── adr/                          # 設計判断の歴史 + 最終決定 (不変、追記のみ)
│   ├── README.md                 # 索引 (gen:adr-index で自動生成)
│   ├── 0001-tooling.md
│   ├── (...)
│   └── 0007-agent-failure-rules.md  # AI agent 失敗事例 live log (例外: 追記可)
├── rules/                        # 現状の運用手順・アーキテクチャ・規約 (本 dir)
│   ├── README.md
│   ├── architecture.md
│   ├── (...)
│   └── skill-authoring.md
├── specs/                        # ADR より動く前提の仕様 (design-direction 等)
│   └── 2026-04-29-design-direction.md
├── superpowers/                  # AI 向け一過性メモ (gitignore、spec / plan の途中成果物)
└── harness-map.md                # ハーネス全体俯瞰
```

その他の SSoT (docs 外):

- `lint-config/` — 機械強制規約の SSoT (例外、md で表現不能)
- `.project-config.yml` — skill 参照 enum (scope / branch prefix 等)
- `CLAUDE.md` — 目次 + AI 固有規律
- `.claude/{skills,agents,commands}/` — AI orchestration (docs/rules/ 参照型)
- file memory (`~/.claude/projects/<project>/memory/`) — session 横断 AI 内部知識
- `README.md` (repo root) — README 系 (本番 deploy / 開発環境セットアップ等、人間向け onboarding の即時情報)

## SSoT 役割分担表

| SSoT | 役割 | 読み手 |
|---|---|---|
| `docs/rules/` | **現状の運用手順・アーキテクチャ・規約 (topic-based、SSoT)** | 人間 + AI + skill |
| `docs/adr/` | 設計判断の歴史 + 最終決定 | 人間 + AI |
| `docs/adr/0007-...` | AI agent 失敗事例 live log | 人間 + AI |
| `docs/specs/` | ADR より動く前提の仕様 | 人間 + AI |
| `docs/harness-map.md` | ハーネス全体俯瞰 | 人間 + AI |
| `README.md` | 開発環境 / 本番 deploy 等の repo onboarding | 人間 |
| `lint-config/` | 機械強制規約の SSoT (例外) | tooling + skill |
| `.project-config.yml` | skill 参照 enum | skill |
| `CLAUDE.md` | 目次 + AI 固有規律 | AI のみ |
| `.claude/{skills,agents,commands}/` | orchestration only | AI |
| `docs/superpowers/` | AI 一過性メモ | AI |
| file memory | session 横断 AI 内部知識 | AI |

## 判定フロー (どこに書くか迷ったら)

1. 機械強制可能か → **`lint-config/`**
2. skill が enum で参照する設定値か → **`.project-config.yml`**
3. 不変の設計判断か → **`docs/adr/`** (新規 ADR)
4. AI agent 失敗事例か → **`docs/adr/0007-agent-failure-rules.md`** に追記
5. ADR より動く前提の仕様か → **`docs/specs/`**
6. ハーネス全体図か → **`docs/harness-map.md`**
7. 開発環境 / 本番 deploy 等の onboarding か → **`README.md`**
8. **人間 + AI 両方が読む現状規約か** → **`docs/rules/`**
9. AI 特有の手順 / 起動規律か → **`.claude/{skills,agents,commands}/`** or **`CLAUDE.md`**
10. session 横断の AI 内部知識か → **file memory**
11. AI 向け一過性メモか → **`docs/superpowers/`**

## 反パターン

- ADR に書ける決定を CLAUDE.md / docs/rules/ に詳細記述 (CLAUDE.md は目次 + AI 固有のみ、docs/rules/ は現状形のみで歴史は ADR 参照)
- docs/rules/ に書ける規約を skill 本体に直書き (skill は orchestration only)
- ADR-0007 と別ファイルで失敗事例を記録 (ai-failures.md の再発防止)
- lint-config で機械強制している規約を docs/rules/ 本文で再記述 (docs/rules/ は「機械強制は `lint-config/X.jsonc`」と参照)
- file memory に設計判断を保存 (ADR-0009 で禁止、ADR-0018 で再強調)
- 規約変更で ADR を書かず docs/rules/ だけ更新 (経緯喪失)
- 規約変更で ADR を書いて docs/rules/ を放置 (現状形が古いまま)

詳細は ADR-0018 (SSoT 境界規約)。

## 関連

- 設計経緯: ADR-0018 (SSoT 境界規約、本 rules の根拠)、ADR-0009 (memory MCP decouple)
- ADR 運用規約: [adr-policy.md](./adr-policy.md)
- skill 規約: [skill-authoring.md](./skill-authoring.md)
