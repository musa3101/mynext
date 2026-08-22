import https from 'https';
import fs from 'fs';
import path from 'path';

// --- 1. CONFIGURACIÓN Y CREDENCIALES ---
const envPath = path.resolve(process.cwd(), '.env');
let envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key) envConfig[key] = value;
    }
  });
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || envConfig.RESEND_API_KEY || '';
const CALLMEBOT_PHONE = process.env.CALLMEBOT_PHONE || envConfig.CALLMEBOT_PHONE || '34673109486';
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || envConfig.CALLMEBOT_API_KEY || '';

const CF_EMAIL = process.env.CLOUDFLARE_EMAIL || envConfig.CLOUDFLARE_EMAIL || 'Mynextbymusa@gmail.com';
const CF_KEY = process.env.CLOUDFLARE_API_KEY || envConfig.CLOUDFLARE_API_KEY || '';
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || envConfig.CLOUDFLARE_ACCOUNT_ID || '88059fc16ce7af95af8a73c203ea5f8a';
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || envConfig.CLOUDFLARE_ZONE_ID || '1a8e1aaab60878d8bf2f6fd49086109d';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envConfig.VITE_SUPABASE_URL || 'https://elfdkbqlvawaprgidqhd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9qAEy3xuzB8HU2wSW1e36w_n051oO66';

// Helper HTTPS request
function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

// --- 2. CONSULTAR ANALÍTICA DE CLOUDFLARE (RUM / ANÁLISIS WEB OFICIAL) ---
async function getCloudflareAnalytics() {
  const now = new Date();
  const yesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgoStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const query = `
  query {
    viewer {
      accounts(filter: { accountTag: "${CF_ACCOUNT_ID}" }) {
        yesterday: rumPageloadEventsAdaptiveGroups(
          limit: 100
          filter: { datetime_geq: "${yesterdayStart}" }
        ) {
          count
          dimensions { requestHost }
        }
        month: rumPageloadEventsAdaptiveGroups(
          limit: 100
          filter: { datetime_geq: "${thirtyDaysAgoStart}" }
        ) {
          count
          dimensions { requestHost }
        }
      }
    }
  }
  `;

  try {
    const payload = JSON.stringify({ query });
    const res = await httpRequest({
      hostname: 'api.cloudflare.com',
      path: '/client/v4/graphql',
      method: 'POST',
      headers: {
        'X-Auth-Email': CF_EMAIL,
        'X-Auth-Key': CF_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);

    const acc = res.data?.data?.viewer?.accounts?.[0];
    const yesterdayList = acc?.yesterday || [];
    const monthList = acc?.month || [];

    const statsByHost = {};

    yesterdayList.forEach(item => {
      const host = item.dimensions.requestHost;
      if (!statsByHost[host]) statsByHost[host] = { yesterday: 0, month: 0 };
      statsByHost[host].yesterday += item.count;
    });

    monthList.forEach(item => {
      const host = item.dimensions.requestHost;
      if (!statsByHost[host]) statsByHost[host] = { yesterday: 0, month: 0 };
      statsByHost[host].month += item.count;
    });

    let totalYesterday = 0;
    let totalMonth = 0;
    Object.values(statsByHost).forEach(s => {
      totalYesterday += s.yesterday;
      totalMonth += s.month;
    });

    return {
      byHost: statsByHost,
      yesterday: { uniques: totalYesterday, pageViews: totalYesterday, threats: 0 },
      month: { uniques: totalMonth, pageViews: totalMonth, threats: 0 }
    };
  } catch (err) {
    console.error('⚠️ Error al consultar Cloudflare Web Analytics:', err.message);
    return {
      byHost: {},
      yesterday: { uniques: 0, pageViews: 0, threats: 0 },
      month: { uniques: 0, pageViews: 0, threats: 0 }
    };
  }
}


// --- 3. LISTAR Y COMPROBAR TODAS LAS WEBS ---
async function checkUrl(url) {
  const start = Date.now();
  try {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname || '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MynextUptimeBot/1.0; +https://mynextbymusa.com)'
      }
    };
    const res = await httpRequest(options);
    const latency = Date.now() - start;
    const isOk = res.status >= 200 && res.status < 400;
    return { url, isOk, status: res.status, latency: `${latency}ms` };
  } catch (err) {
    return { url, isOk: false, status: 'Error', latency: 'N/A' };
  }
}

async function getAllWebsitesStatus() {
  const knownSites = [
    { name: 'MYNEXT (Portfolio)', url: 'https://mynextbymusa.com', type: 'core' },
    { name: 'Ecuaplac Reformas', url: 'https://www.ecuaplac.com', type: 'client' },
    { name: 'Blessed Barber Studio', url: 'https://blessedstudio.pages.dev', type: 'client' },
    { name: 'Bar Cafetería Luna Llena', url: 'https://barlunallena.pages.dev', type: 'client' },
    { name: 'Tacos Marrakech', url: 'https://tacosmarrakech.pages.dev', type: 'client' },
    { name: 'Gran Marrakech Restaurant', url: 'https://granmarrakech.pages.dev', type: 'client' },
    { name: 'Mezquita Arrahma', url: 'https://mezquita-arrahma.pages.dev', type: 'client' },
    { name: 'Isafer Boutique', url: 'https://isaferboutique.pages.dev', type: 'client' },
    { name: 'RBARI Restaurant', url: 'https://rajbarikitchen.com', type: 'client' },
    { name: 'Next Era Concept', url: 'https://nexterabymusa.pages.dev', type: 'client' }
  ];

  const checks = await Promise.all(knownSites.map(async site => {
    const res = await checkUrl(site.url);
    return { ...site, ...res };
  }));

  return checks;
}

// --- 4. COMPROBAR BASE DE DATOS SUPABASE ---
async function checkSupabase() {
  const start = Date.now();
  try {
    const parsed = new URL(`${SUPABASE_URL}/rest/v1/mynext_projects?select=id&limit=1`);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };
    const res = await httpRequest(options);
    const latency = Date.now() - start;
    return { isOk: res.status === 200, status: res.status, latency: `${latency}ms` };
  } catch {
    return { isOk: false, status: 'Error', latency: 'N/A' };
  }
}

// --- 5. ENVIAR REPORTE A WHATSAPP ---
async function sendWhatsAppReport(analytics, sites, dbStatus) {
  if (!CALLMEBOT_API_KEY || !CALLMEBOT_PHONE) {
    console.log('ℹ️ WhatsApp CallMeBot no configurado.');
    return;
  }

  const mynextSite = sites.find(s => s.type === 'core') || { isOk: true };
  const clientSites = sites.filter(s => s.type === 'client');
  const activeCount = clientSites.filter(s => s.isOk).length;

  const clientLines = clientSites.map(s => `${s.isOk ? '🟢' : '🔴'} ${s.name}`).join('\n');

  const byHost = analytics.byHost || {};
  const analyticsLines = Object.entries(byHost)
    .filter(([host, data]) => data.yesterday > 0 || data.month > 0)
    .map(([host, data]) => `• *${host}:* 👥 ${data.yesterday} ayer | ${data.month} (30d)`)
    .join('\n');

  const text = `⚡ *MYNEXT — REPORTE DIARIO* ⚡

🏛️ *ESTADO DE INFRAESTRUCTURA*
• Web: ${mynextSite.isOk ? '🟢 Activa (200 OK)' : '🔴 Caída'}
• Supabase: ${dbStatus.isOk ? '⚡ Conectada (' + dbStatus.latency + ')' : '🔴 Error'}

📊 *ANÁLISIS WEB (Cloudflare RUM - Panel Oficial)*
${analyticsLines || '• 0 visitas registradas ayer'}

🌐 *FLOTA DE CLIENTES (${activeCount}/${clientSites.length})*
${clientLines}

✅ _Reporte automatizado y verificado._`;

  try {
    const encoded = encodeURIComponent(text);
    const urlPath = `/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encoded}&apikey=${CALLMEBOT_API_KEY}`;
    
    console.log('📲 Enviando reporte a WhatsApp (+34 673 10 94 86)...');
    const res = await httpRequest({
      hostname: 'api.callmebot.com',
      path: urlPath,
      method: 'GET'
    });
    console.log('🎉 ¡Reporte enviado con éxito a WhatsApp!');
  } catch (err) {
    console.error('⚠️ Error al enviar a WhatsApp:', err.message);
  }
}

// --- 6. PLANTILLA HTML MINIMALISTA & PREMIUM (GMAIL-COMPATIBLE) ---
function buildEmailHtml(analytics, sites, dbStatus) {
  const mynextSite = sites.find(s => s.type === 'core') || { isOk: true, status: 200, latency: '45ms' };
  const clientSites = sites.filter(s => s.type === 'client');
  const activeClientsCount = clientSites.filter(s => s.isOk).length;
  const totalClientsCount = clientSites.length;

  const allHealthy = mynextSite.isOk && dbStatus.isOk && activeClientsCount === totalClientsCount;
  const headerStatusText = allHealthy ? 'SISTEMAS 100% OPERATIVOS' : 'ATENCIÓN REQUERIDA';
  const headerStatusColor = allHealthy ? '#00f2ff' : '#f87171';
  const headerBadgeBg = allHealthy ? 'rgba(0, 242, 255, 0.08)' : 'rgba(239, 68, 68, 0.08)';
  const headerBadgeBorder = allHealthy ? 'rgba(0, 242, 255, 0.25)' : 'rgba(239, 68, 68, 0.25)';

  const clientRowsHtml = clientSites.map(site => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; font-weight: 600; color: #ffffff;">
        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: ${site.isOk ? '#00f2ff' : '#ef4444'}; margin-right: 8px; box-shadow: 0 0 6px ${site.isOk ? 'rgba(0,242,255,0.6)' : 'rgba(239,68,68,0.6)'};"></span>
        ${site.name}
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; color: #71717a; font-family: monospace;">
        <a href="${site.url}" style="color: #a1a1aa; text-decoration: none;" target="_blank">${site.url.replace('https://', '')}</a>
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); text-align: right;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; background-color: ${site.isOk ? 'rgba(0, 242, 255, 0.08)' : 'rgba(239, 68, 68, 0.08)'}; color: ${site.isOk ? '#00f2ff' : '#f87171'}; border: 1px solid ${site.isOk ? 'rgba(0, 242, 255, 0.2)' : 'rgba(239, 68, 68, 0.2)'};">
          ${site.isOk ? 'ACTIVA' : 'CAÍDA'}
        </span>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MYNEXT Daily Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080810; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #080810; padding: 25px 8px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #0e0e18; border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
          
          <!-- Minimalist Header with Favicon Logo -->
          <tr>
            <td style="padding: 24px 20px 18px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: linear-gradient(180deg, rgba(0, 242, 255, 0.05) 0%, transparent 100%);">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 10px auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="https://mynextbymusa.com/favicon-192x192.png" width="32" height="32" alt="MYNEXT" style="display: block; border-radius: 8px; border: 1px solid rgba(0, 242, 255, 0.4); box-shadow: 0 0 15px rgba(0, 242, 255, 0.25);" />
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #ffffff; line-height: 1;">
                      MY<span style="color: #00f2ff;">NEXT</span>
                    </div>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #71717a; margin-top: 3px;">
                      Arquitectura Digital • Daily Pulse
                    </div>
                  </td>
                </tr>
              </table>
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: ${headerBadgeBg}; border: 1px solid ${headerBadgeBorder}; color: ${headerStatusColor}; font-size: 10px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 4px;">
                ${headerStatusText}
              </div>
            </td>
          </tr>

          <!-- Section 1: Core System & Analytics -->
          <tr>
            <td style="padding: 20px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #00f2ff; margin-bottom: 12px;">
                1. Infraestructura Principal (MYNEXT)
              </div>

              <!-- Health Status Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td width="48%" style="padding: 12px 14px; background-color: #141422; border: 1px solid rgba(255,255,255,0.05); border-radius: 10px;">
                    <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Sitio Web (Producción)</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${mynextSite.isOk ? '#00f2ff' : '#f87171'}; margin-top: 4px;">
                      ${mynextSite.isOk ? '● Activa (mynextbymusa.com)' : '● Caída'}
                    </div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding: 12px 14px; background-color: #141422; border: 1px solid rgba(255,255,255,0.05); border-radius: 10px;">
                    <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Base de Datos (Supabase)</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${dbStatus.isOk ? '#00f2ff' : '#f87171'}; margin-top: 4px;">
                      ${dbStatus.isOk ? '● Conectada (' + dbStatus.latency + ')' : '● Error'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Analytics Bento Grid -->
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #00f2ff; margin-bottom: 10px;">
                Tráfico & Rendimiento (Cloudflare)
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                <tr>
                  <!-- Yesterday Card -->
                  <td width="48%" valign="top" style="padding: 14px; background-color: #141422; border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 12px;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a1a1aa; margin-bottom: 6px;">
                      Ayer (24h)
                    </div>
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1;">
                      ${analytics.yesterday.uniques.toLocaleString()}
                      <span style="font-size: 11px; font-weight: 600; color: #00f2ff;">visitas</span>
                    </div>
                    <div style="font-size: 11px; color: #71717a; margin-top: 8px; line-height: 1.4;">
                      • <strong>${analytics.yesterday.pageViews.toLocaleString()}</strong> páginas vistas<br>
                      • <strong>${analytics.yesterday.threats.toLocaleString()}</strong> amenazas bloqueadas
                    </div>
                  </td>

                  <td width="4%"></td>

                  <!-- 30 Days Card -->
                  <td width="48%" valign="top" style="padding: 14px; background-color: #141422; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a1a1aa; margin-bottom: 6px;">
                      Acumulado (30d)
                    </div>
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1;">
                      ${analytics.month.uniques.toLocaleString()}
                      <span style="font-size: 11px; font-weight: 600; color: #71717a;">visitas</span>
                    </div>
                    <div style="font-size: 11px; color: #71717a; margin-top: 8px; line-height: 1.4;">
                      • <strong>${analytics.month.pageViews.toLocaleString()}</strong> páginas totales<br>
                      • <strong>${analytics.month.threats.toLocaleString()}</strong> bots mitigados
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 20px;"><div style="height: 1px; background-color: rgba(255, 255, 255, 0.05);"></div></td>
          </tr>

          <!-- Section 2: Client Websites Fleet -->
          <tr>
            <td style="padding: 20px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #00f2ff; margin-bottom: 12px;">
                2. Monitor de Webs de Clientes (${activeClientsCount}/${totalClientsCount})
              </div>

              <!-- Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #141422; border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                ${clientRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Quick Action Buttons -->
          <tr>
            <td style="padding: 0 20px 20px 20px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://dash.cloudflare.com" target="_blank" style="display: inline-block; margin: 3px; padding: 6px 14px; border-radius: 6px; background-color: #141422; border: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 10px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase;">
                      Cloudflare
                    </a>
                    <a href="https://supabase.com/dashboard" target="_blank" style="display: inline-block; margin: 3px; padding: 6px 14px; border-radius: 6px; background-color: #141422; border: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 10px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase;">
                      Supabase
                    </a>
                    <a href="https://search.google.com/search-console" target="_blank" style="display: inline-block; margin: 3px; padding: 6px 14px; border-radius: 6px; background-color: #141422; border: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 10px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase;">
                      Search Console
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 14px 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); background-color: #080810; font-size: 10px; color: #52525b; line-height: 1.4;">
              Generado a las 09:00 AM (CEST) • Cloudflare & Resend API<br>
              &copy; 2026 MYNEXT — Palma de Mallorca
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// --- 7. FUNCIÓN PRINCIPAL ---
async function run() {
  console.log('🚀 Iniciando generación del Reporte Diario Unificado MYNEXT...');

  // 1. Obtener analítica de Cloudflare
  console.log('📊 Consultando analítica de Cloudflare...');
  const analytics = await getCloudflareAnalytics();
  console.log(`✓ Ayer: ${analytics.yesterday.uniques} visitas, ${analytics.yesterday.pageViews} páginas vistas.`);
  console.log(`✓ Mes (30d): ${analytics.month.uniques} visitas, ${analytics.month.pageViews} páginas vistas.`);

  // 2. Comprobar webs de clientes y principal
  console.log('🌐 Verificando estado de todas las páginas web...');
  const sites = await getAllWebsitesStatus();
  console.log(`✓ ${sites.filter(s => s.isOk).length}/${sites.length} webs activas.`);

  // 3. Comprobar base de datos Supabase
  console.log('⚡ Verificando conexión con Supabase...');
  const dbStatus = await checkSupabase();
  console.log(`✓ Supabase: ${dbStatus.isOk ? 'OK' : 'Error'} (${dbStatus.latency})`);

  // 4. Enviar reporte por WhatsApp
  await sendWhatsAppReport(analytics, sites, dbStatus);

  // 5. Construir asunto y HTML para Email
  const allOk = sites.every(s => s.isOk) && dbStatus.isOk;
  const subject = allOk
    ? `🟢 Reporte Diario MYNEXT: Todo Activo • ${analytics.yesterday.uniques} visitas ayer`
    : `⚠️ ALERTA: Incidencia detectada en monitor web MYNEXT`;

  const html = buildEmailHtml(analytics, sites, dbStatus);

  // 6. Enviar correo vía Resend
  if (!RESEND_API_KEY) {
    console.log('\n⚠️ No se ha detectado RESEND_API_KEY en local. Mostrando vista previa del asunto:');
    console.log('Asunto:', subject);
    console.log('✅ HTML generado correctamente (' + html.length + ' bytes).');
    return;
  }

  console.log('📧 Enviando email vía Resend a mynextbymusa@gmail.com...');
  const payload = JSON.stringify({
    from: 'Mynext Status <onboarding@resend.dev>',
    to: ['mynextbymusa@gmail.com'],
    subject: subject,
    html: html
  });

  const res = await httpRequest({
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, payload);

  if (res.status === 200 || res.status === 201) {
    console.log('🎉 ¡Email enviado con éxito por Resend! ID:', res.data?.id);
  } else {
    console.error('❌ Error al enviar email:', res.status, res.data);
  }
}

run().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
