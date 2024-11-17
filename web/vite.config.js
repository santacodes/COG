import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Same as Webpack's 'dist' folder
  },
  server: {
    port: 8091, // Match your Webpack dev server port
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Use alias for cleaner imports
      os: 'os-browserify',
    },
  },
});
