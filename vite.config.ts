import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // TODO: 部署到 GitHub Pages 时，将此处替换为你的 GitHub 仓库名（例如 '/quantum-brain/'）。
      // 如果你的仓库名刚好是 "你的用户名.github.io"，请将这里改为 '/'
      base: 'https://tenzindann.github.io/quantum-brain-fmri/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
