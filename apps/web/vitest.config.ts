import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.ts"],
    env: {
      DATABASE_URL:
        "postgresql://liitto:liitto_dev_password@localhost:5432/liitto_test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/api/**/*.ts", "db/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.config.ts", "db/seed.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
