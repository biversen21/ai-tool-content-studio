import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const envDir = resolve(__dirname, "..");
  const env = loadEnv(mode, envDir, "");
  const port = env.PORT ?? "4000";
  const backendUrl = `http://localhost:${port}`;
  console.log("[vite.config] __dirname:", __dirname);
  console.log("[vite.config] envDir:", envDir);
  console.log("[vite.config] PORT from loadEnv:", env.PORT);
  console.log("[vite.config] proxy target:", backendUrl);

  return {
    plugins: [react()],
    envDir: resolve(__dirname, ".."),
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
