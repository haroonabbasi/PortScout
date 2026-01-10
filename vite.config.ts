import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/scan': 'http://127.0.0.1:8000',
        '/kill': 'http://127.0.0.1:8000',
        '/open': 'http://127.0.0.1:8000'
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.APP_VERSION': JSON.stringify(packageJson.version)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    publicDir: 'assets'
  };
});
