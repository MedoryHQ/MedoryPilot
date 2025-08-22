import path from "path";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic"
    }),
    nodePolyfills(),
    tailwindcss()
  ],
  server: {
    port: 4000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
