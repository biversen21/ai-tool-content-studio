import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readDotEnv(): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(resolve(__dirname, "../.env"), "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).replace(/^["']|["']$/g, "").trim()];
        }),
    );
  } catch {
    return {};
  }
}

const dotenv = readDotEnv();
const backendUrl = `http://localhost:${dotenv.PORT ?? "4000"}`;
console.log("[vite.config] proxy target:", backendUrl);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
