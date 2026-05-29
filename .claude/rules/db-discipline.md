---
description: DB schema/mutation 編集時の規律 (FAIL-003 防御)
paths:
  - "src/entities/**/schema.ts"
  - "src/shared/lib/db/**"
  - "src/features/**/api/mutations/**"
---

# DB 編集時の規律

DB 書込 mutation の spec/plan は **UPSERT/batch × CHECK/UNIQUE/FK の相互作用を実機 SQL で再現確認必須** (FAIL-003、ADR-0007)。

- 机上の SQL 設計を merge 前提にしない
- 特に `INSERT ... ON CONFLICT DO UPDATE`: **SQLite は DO UPDATE 切替前に INSERT 候補行の CHECK を評価する**ため、INSERT 候補値は生 delta でなく最終結果値 (`(既存値 or 0) + delta`) にそろえる
- **mutation PR は controller 自身がマージ前に制約違反系の手動 smoke を実施** (ユーザー任せにしない)
- 必須境界ケース: 在庫 1→0 が成功 / 0→-1 が拒否され台帳も増えない (CHECK + batch rollback)

## 関連

- `docs/rules/domain-modeling.md` (Drizzle schema SSoT 知識)
- ADR-0007 FAIL-003 (UPSERT CHECK 評価順 失敗事例)
- ADR-0024 (本 rule の起源、`.claude/rules/` 採用判断)
