import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  root: "app",
  plugins: [vue()],
  build: {
    assetsDir: "assets",
    emptyOutDir: false,
    outDir: "../",
  },
});
