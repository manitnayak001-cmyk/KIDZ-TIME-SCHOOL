import { defineConfig } from "vitest/config";
import path from "path";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"], environment: "node", fileParallelism: false, testTimeout: 60_000, hookTimeout: 180_000,
    globalSetup: ["tests/global-setup.ts"],
    // Tests use their own throw-away database, never the real one.
    env: { PAYLOAD_SECRET: "test-secret-test-secret-test-secret", SQLITE_URL: "file:./.test-data/test.db", MEDIA_DIR: "./.test-data/media", SITE_URL: "http://localhost:3000", NOTIFY_EMAIL: "" },
  },
  resolve: { alias: { "@payload-config": path.resolve("src/payload.config.ts"), "@": path.resolve("src") } },
});
