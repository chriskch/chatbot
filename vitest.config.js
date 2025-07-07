// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
import { config } from "dotenv";

// Entscheide dynamisch, welche .env geladen wird
const envFile = process.env.CI === "true" ? ".env.test" : ".env";

console.log(`✅ Loading environment variables from ${envFile}`);
config({ path: envFile });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    sequence: {
      hooks: "stack",
    },
    setupFiles: ["./tests/unit/setup.js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
