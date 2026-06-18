import { defineConfig } from 'vite';
// @ts-ignore
import path from 'path';

export default defineConfig({
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
        planesEn: path.resolve(__dirname, 'planes/index-en.html')
      }
    }
  }
});
