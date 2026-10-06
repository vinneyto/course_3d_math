import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("..", import.meta.url)),
  define: {
    __DEMO_ENTRY__: JSON.stringify("../exercises/01-create-vector/demo.ts"),
  },
  build: {
    outDir: "sandbox/dist",
    rollupOptions: {
      input: fileURLToPath(new URL("./index.html", import.meta.url)),
    },
  },
});
