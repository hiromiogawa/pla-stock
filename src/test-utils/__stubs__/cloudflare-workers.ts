// vitest 用 stub: production code が誤って test bundle に取り込まれたとき
// import が解決される程度の no-op を返す。実際の使用箇所は vi.mock で差し替えること。
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
