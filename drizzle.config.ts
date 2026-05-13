import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/entities/*/schema.ts',
  out: './drizzle/migrations',
})
