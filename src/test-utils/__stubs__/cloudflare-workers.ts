// vitest 用 guard stub: production code が誤って test bundle に取り込まれたとき
// import 解決を通しつつ、env への実アクセスがあれば例外を投げて差し替え漏れを
// 明示的に通知する。test 側で `vi.mock` により module 全体を差し替えるのが正規。
export const env = new Proxy(
  {},
  {
    get(_target, prop) {
      throw new Error(
        `cloudflare:workers の env.${String(prop)} に test から触れています。vi.mock で module を差し替えてください。`,
      )
    },
  },
)
