import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
import { cartographer } from '@replit/vite-plugin-cartographer';
import { devBanner } from '@replit/vite-plugin-dev-banner';

export default defineConfig(({ command, mode }) => {
  // Load env variables based on current working directory
  const env = loadEnv(mode, process.cwd(), '');

  const rawPort = env.PORT || process.env.PORT;

  if (command === 'serve' && !rawPort) {
    throw new Error(
      'PORT environment variable is required but was not provided.',
    );
  }

  const port = rawPort ? Number(rawPort) : undefined;

  if (rawPort && (Number.isNaN(port) || (port as number) <= 0)) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = env.BASE_PATH || process.env.BASE_PATH || '/';

  // Explicitly pull BACKEND_PORT from env file, default to 3001 or 5000 if not found
  const backendPort = env.BACKEND_PORT || process.env.BACKEND_PORT || 3001;

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== 'production' &&
        process.env.REPL_ID !== undefined
        ? [
          cartographer({
            root: path.resolve(import.meta.dirname, '..'),
          }),
          devBanner(),
        ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});