import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import CloudflarePagesFunctions from 'vite-plugin-cloudflare-functions';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      CloudflarePagesFunctions({
        wrangler: {
          port: 8788,
          log: true,
          r2: [
            'CARTEL_NFT',
          ],
        }
      })
    ],
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    }
  }
})
