// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
