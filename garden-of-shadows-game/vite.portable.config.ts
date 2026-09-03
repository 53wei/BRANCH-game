import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "portable",
  publicDir: "../public",
  base: "/",
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "../release/portable-client",
    emptyOutDir: true,
    target: "es2022",
  },
});
