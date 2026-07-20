import { defineConfig } from "vite";

const repositoryName = "engse203-lab02-68543210016-0";

export default defineConfig({
  base: `/${repositoryName}/`,
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});