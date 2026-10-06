import { defineConfig } from "vitest/config";

// Keep paths relative to the invocation directory so root lesson commands work.
export default defineConfig({
  test: { include: ["**/task.test.ts"], exclude: ["**/node_modules/**"] },
});
