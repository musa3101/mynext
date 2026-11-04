import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { onRequestPost } from './functions/api/contact.ts';

const resolveHtml = (relPath: string) =>
  decodeURIComponent(new URL(relPath, import.meta.url).pathname);

function localContactApiPlugin() {
  return {
    name: 'local-contact-api',
    configureServer(server: any) {
      server.middlewares.use('/api/contact', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const host = req.headers.host || 'localhost:5173';
            const webReq = new Request(`http://${host}/api/contact`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                ...req.headers,
              },
              body: body,
            });
            const mockContext: any = {
              request: webReq,
              functionPath: '/api/contact',
              waitUntil: (p: Promise<any>) => { void p; },
              next: async () => new Response(''),
              env: {
                TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
              },
              params: {},
              data: {},
            };
            const cfRes = await onRequestPost(mockContext);
            res.statusCode = cfRes.status;
            res.setHeader('Content-Type', 'application/json');
            const resJson = await cfRes.text();
            res.end(resJson);
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e?.message || 'Server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), localContactApiPlugin()],
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
      },
      // Sufijo "-r2": fuerza nombres nuevos para saltar una entrada envenenada en la caché edge de Cloudflare
      output: {
        entryFileNames: 'assets/[name]-[hash]-r2.js',
        chunkFileNames: 'assets/[name]-[hash]-r2.js',
        assetFileNames: 'assets/[name]-[hash]-r2[extname]',
      }
    }
  }
});


