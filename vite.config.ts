import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const resolveHtml = (relPath: string) =>
  decodeURIComponent(new URL(relPath, import.meta.url).pathname);

export default defineConfig({
  plugins: [tailwindcss()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolveHtml('./index.html'),
        en: resolveHtml('./index-en.html'),
        planes: resolveHtml('./planes/index.html'),
        'planes-en': resolveHtml('./planes/index-en.html'),
        project: resolveHtml('./project.html'),
        'project-en': resolveHtml('./project-en.html'),
      }
    }
  }
});


