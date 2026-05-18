import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';
import sitemap from "vite-plugin-sitemap";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(),sitemap({
      hostname: env.CLIENT_URL,
    }),],
    server: {
      port: Number(env.PORT),
      strictPort: true,
      host: env.HOST,
      proxy: {
        '/api': {
          target: env.VITE_BASE_URL,
          changeOrigin: true,
        },
      }
    }
  }
})
