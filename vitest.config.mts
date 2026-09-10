import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    exclude: ["node_modules", ".next", "e2e/**"],
    // Pinned so formatListedAt's local-time formatting (and anything else
    // touching Date) produces identical output on every machine and in CI.
    env: { TZ: "UTC" },
  },
})
