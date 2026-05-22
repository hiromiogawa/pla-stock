# ADR-0014: 写真アップロードの受け入れ形式

- ステータス: 承認
- 日付: 2026-05-22
- 関連: Epic #6 (Phase D)、ADR-0013 (画像ストレージ)、#135、#136

## コンテキスト

#135 で project 写真の R2 アップロードを実装した際、アップロード server fn の形式検証が `file.type.startsWith('image/')` のみだった。このため iPhone 標準の HEIC（`image/heic`）が検証を通過し、R2 に保存はできるが Chrome / Firefox が HEIC をデコードできず `<img>` で表示できない状態になった（保存できるが表示できない不具合）。

受け入れ可否を MIME の `image/` prefix で判定すると、「画像ではあるがブラウザが表示できない形式」を弾けない。受け入れ可否は「システムが end-to-end で扱えるか（保存だけでなく配信・表示までできるか）」で判断する必要がある。

## 決定

写真アップロードの受け入れ形式を、ブラウザが確実に表示でき `browser-image-compression` の Canvas パイプラインでデコードできる **`image/jpeg` / `image/png` / `image/webp` の allowlist に限定**する。HEIC / HEIF およびその他の形式は拒否する（変換しない）。

allowlist は `src/shared/lib/image/constants.ts` の `ACCEPTED_IMAGE_TYPES` を SSoT とし、client（`compressImage.ts`）と server fn（`features/project-photo-add/schemas.ts`）の双方が参照する。`constants.ts` は browser-only な import を持たないため、server バンドルに browser-image-compression を巻き込まない。

#136 の圧縮実装により、アップロードされる実体は常に WebP に変換される。

## 選択肢

| 選択肢 | メリット | デメリット |
|--------|---------|----------|
| **A. allowlist 限定で HEIC 拒否（採用）** | 新規ライブラリ不要、保存できるものは必ず表示できる、実装が単純 | PC で `.heic` を直接選んだ場合は弾かれる |
| B. heic-to 等で HEIC→WebP 変換 | iPhone の HEIC をそのまま受けられる | libheif の WASM が bundle に乗り重い。MVP のスコープに見合わない |

iOS Safari は `<input type=file>` での選択時に HEIC を JPEG へ自動変換することが多く、iPhone ユーザーが案 A で受ける実害は限定的と判断した。

## 結果

### 良い面

- 「保存できたのに表示できない」状態が構造的に発生しなくなる
- 受け入れ判定の SSoT が `ACCEPTED_IMAGE_TYPES` 一箇所に集約され、client / server で一致する
- 新規ライブラリ依存が増えない（`browser-image-compression` は ADR-0013 / #137 で導入済み）

### 悪い面・受容するコスト

- PC から HEIC ファイルを直接アップロードしたいケースは拒否される
- 将来 HEIC 変換が必要になった場合は案 B（heic-to 等）を新 ADR で再検討する
