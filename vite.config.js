import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function computeAudioManifestVersion() {
  try {
    const manifestPath = path.resolve(__dirname, 'public', 'audio-manifest.json');
    if (fs.existsSync(manifestPath)) {
      return crypto
        .createHash('sha1')
        .update(fs.readFileSync(manifestPath))
        .digest('hex')
        .slice(0, 12);
    }
  } catch {
    // Fallback below if manifest cannot be hashed
  }
  return '';
}

const audioManifestVersion = computeAudioManifestVersion();

function audioManifestPreloadPlugin(version) {
  return {
    name: 'audio-manifest-preload',
    transformIndexHtml() {
      if (!version) return [];
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'fetch',
            crossorigin: '',
            href: `./audio-manifest.json?v=${version}`
          },
          injectTo: 'head'
        }
      ];
    }
  };
}

export default defineConfig({
  plugins: [react(), audioManifestPreloadPlugin(audioManifestVersion)],
  base: './', // Ensures relative assets work on GitHub Pages, Netlify subpaths, and offline
  define: {
    __AUDIO_MANIFEST_VERSION__: JSON.stringify(audioManifestVersion)
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
