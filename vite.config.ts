import { defineConfig } from "vite";

export default defineConfig({
  base: "/rpg-2d-mobile-web/",
  server: {
    host: "127.0.0.1",
    port: 4173,
    allowedHosts: ["127.0.0.1.nip.io"],
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    allowedHosts: ["127.0.0.1.nip.io"],
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: true,
  },
});
