import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

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
            const data = JSON.parse(body || '{}');
            const isEs = data.language !== 'en';

            // Honeypot check
            if (data._honey && data._honey.trim().length > 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Filtered by honeypot', filtered: true }));
              return;
            }

            // Validations
            if (!data.name || !data.email) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: isEs ? 'Nombre y email requeridos' : 'Name and email required' }));
              return;
            }

            // Turnstile token check
            const token = data['cf-turnstile-response'];
            if (!token) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: isEs ? 'Verificación de seguridad requerida' : 'Security check required' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                message: isEs
                  ? '¡Gracias! Hemos recibido tu propuesta (Modo Dev local).'
                  : 'Thank you! We received your proposal (Local Dev Mode).',
              })
            );
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
      }
    }
  }
});


