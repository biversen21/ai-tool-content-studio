import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(process.cwd(), ".."), "");
  const backendUrl = env.VITE_API_BASE_URL ?? "http://localhost:4000";

  return {
    plugins: [react()],
    envDir: "..",
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
