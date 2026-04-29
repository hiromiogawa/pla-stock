# pla-stock デザイン方向性

- 日付: 2026-04-29
- ステータス: 確定 (PR #58 着手時点)
- 関連: ADR-0002 (MUI 採用), `frontend-design` skill

`frontend-design` skill の Design Thinking 4 観点 (Purpose / Tone / Constraints / Differentiation) で確定。UI 変更時はこの spec を参照、特に Tone と Differentiation を保つ。

## Purpose

ガンプラ・模型塗料モデラーの **個人趣味** の在庫・製作管理ツール。  
日常的に開く「自分の道具」としての位置づけ。SaaS 業務ツールではない。

## Tone — **Refined Minimalism**

Linear / Notion / Vercel dashboard 流の道具感。

- 無彩色中心、彩度低
- 密度高め、機能性最優先
- 装飾要素は最小限 (illustration / texture / gradient mesh 等は採用しない)
- 動きは控えめ (notistack の auto-dismiss / TanStack Router の pendingComponent 程度)

## Constraints

- TanStack Start + MUI v7 + Emotion + Cloudflare Workers
- mobile-first (`xs` / `md` breakpoint で出し分け)
- 日本語 UI (commitlint subject-case off / 日本語 typography で文字組調整)
- AI 親和性のため M3 ガイドライン (https://m3.material.io/) 参照

## Differentiation — **塗料の color swatch**

「これは忘れない」と感じる **唯一の強い視覚要素**。

- Paint master に `hex: string` を保持 (現状未採用、今後の schema 拡張で対応)
- PaintList / PaintCard / PaintDetail に色 dot/swatch を render
- Refined Minimalism との整合のため **小さな円形 dot 程度の慎ましさ** (例: 12px 直径)
- **色情報は唯一許容される強い視覚要素**。他要素は無彩色維持で「色だけが語る」状態を作る

模型趣味者が「ホビー店の塗料棚」感覚で在庫を眺められることを目指す。

## Typography

system-ui + Hiragino Sans + Noto Sans JP fallback (現状維持)。

- 日本語 web で system font は AI 感ではなく **環境ネイティブ** で好印象
- 切替は工数大 (font subset / WOFF2 / CDN / preload 等)、Phase 3 範囲外
- 将来 web font 採用するなら Inter (英) + Noto Sans JP (日) ペアが標準的

## Color

**Primary は緑系 (M3 green tonal palette)**。

- Refined Minimalism の規律: アクセントは primary + status (error/warning/success/info) のみ、追加カラー禁止
- Status は MUI default を継続 (error 赤系、warning 橙系、info 青系)
- 元来は無彩色 (slate 風) 案だったが、模型趣味の道具感を僅かに加味して緑寄せ
- 主役は **塗料の color swatch** (Differentiation)、UI 自体の彩度はあくまで控えめ

## Theme tokens の置き場

実装は `src/theme/tokens.ts` の `tonalPalettes.primary` にて。schema は M3 tonal palette (0/10/20/.../99/100 の 13 段階)。

## 採用しなかった候補

- **Editorial / Magazine トーン** (Stripe 風): 媒体感が出すぎ、utility tool に不適
- **Workshop / Craft トーン** (模型 craft 感): 個性出るが MVP スコープで重い、将来再検討
- **Quick search (cmd+k pallette)**: 良案だが Phase 3 範囲外、将来追加候補
- **ストック数の dot indicator**: 機能的だが視覚要素を増やしすぎ、Refined Minimalism の規律と衝突
- **Material You 動的 color**: 実装複雑、利点低
- **Web font 採用**: 工数大、現時点不採用

## frontend-design skill の運用

UI を新規追加・変更する際は `frontend-design` skill を invoke、本 spec の方針との整合性を確認する。

特に:
- Tone (Refined Minimalism) を維持
- Differentiation (塗料 swatch) を強める方向は OK、それ以外の視覚要素は最小化
- skill が「Choose a clear conceptual direction and execute it with precision」と要求する通り、**中庸** (= 装飾も無装飾も中途半端) を避ける
