import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets work on GitHub Pages, Netlify subpaths, and offline
  test: {
    globals: true,
    environment: 'node'
  }
});
