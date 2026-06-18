import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
// @ts-ignore
import path from 'path';
// @ts-ignore
import { fileURLToPath } from 'url';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
// @ts-ignore
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [tailwindcss()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        // @ts-ignore
        main: path.resolve(__dirname, 'index.html'),
        // @ts-ignore
        en: path.resolve(__dirname, 'index-en.html'),
        // @ts-ignore
        planes: path.resolve(__dirname, 'planes/index.html'),
        // @ts-ignore
        'planes-en': path.resolve(__dirname, 'planes/index-en.html'),
      }
    }
  }
});

