import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    // Use relative asset paths for reliable GitHub Pages project-site loading.
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('/three/examples/jsm/')) return 'vendor-three-examples';
            if (id.includes('/three/')) return 'vendor-three-core';
            if (id.includes('@react-three/fiber')) return 'vendor-react-three-fiber';
            if (id.includes('@react-three/drei')) return 'vendor-react-three-drei';
            if (id.includes('framer-motion')) return 'vendor-framer-motion';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('/react/')) return 'vendor-react';
            if (id.includes('/react-dom/')) return 'vendor-react-dom';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
