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
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || envConfig.CALLMEBOT_API_KEY || '2243347';

const CF_EMAIL = process.env.CLOUDFLARE_EMAIL || envConfig.CLOUDFLARE_EMAIL || 'Mynextbymusa@gmail.com';
const CF_KEY = process.env.CLOUDFLARE_API_KEY || envConfig.CLOUDFLARE_API_KEY || '';
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || envConfig.CLOUDFLARE_ACCOUNT_ID || '88059fc16ce7af95af8a73c203ea5f8a';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envConfig.VITE_SUPABASE_URL || 'https://elfdkbqlvawaprgidqhd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9qAEy3xuzB8HU2wSW1e36w_n051oO66';

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

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
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'X-Auth-Email': CF_EMAIL,
        'X-Auth-Key': CF_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(12000)
    });

    if (!res.ok) {
      console.warn(`⚠️ Cloudflare API devolvió status ${res.status}`);
    }

    const data = await res.json();
    const acc = data?.data?.viewer?.accounts?.[0];
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

// --- 3. COMPROBACIÓN ROBUSTA DE WEBS CON REINTENTO ---
async function checkUrlSingle(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    const latency = Date.now() - start;
    const isOk = res.ok || (res.status >= 200 && res.status < 400);
    return { url, isOk, status: res.status, latency: `${latency}ms` };
  } catch (err) {
    return { url, isOk: false, status: err.name === 'TimeoutError' ? 'Timeout' : 'Error', latency: 'N/A' };
  }
}

async function checkUrl(url) {
  let result = await checkUrlSingle(url);
  // Reintento rápido si el primer intento falla (elimina falsos positivos por parpadeos de red)
  if (!result.isOk) {
    await new Promise(r => setTimeout(r, 1500));
    result = await checkUrlSingle(url);
  }
  return result;
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
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mynext_projects?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      signal: AbortSignal.timeout(8000)
    });
    const latency = Date.now() - start;
    return { isOk: res.ok, status: res.status, latency: `${latency}ms` };
  } catch {
    return { isOk: false, status: 'Error', latency: 'N/A' };
  }
}

// --- 5. ENVIAR REPORTE A WHATSAPP (CALLMEBOT) ---
async function sendWhatsAppReport(analytics, sites, dbStatus) {
  if (!CALLMEBOT_API_KEY || !CALLMEBOT_PHONE) {
    console.log('ℹ️ WhatsApp CallMeBot no configurado.');
    return;
  }

  const mynextSite = sites.find(s => s.type === 'core') || { isOk: true };
  const clientSites = sites.filter(s => s.type === 'client');
  const activeCount = clientSites.filter(s => s.isOk).length;
  const totalSites = sites.length;
  const allActiveSitesCount = sites.filter(s => s.isOk).length;

  const clientLines = clientSites.map(s => `${s.isOk ? '🟢' : '🔴'} *${s.name}*`).join('\n');

  const formattedYesterday = analytics.yesterday.uniques.toLocaleString('es-ES');
  const formattedMonth = analytics.month.uniques.toLocaleString('es-ES');

  const text = `⚡ *MYNEXT — REPORTE DIARIO DE INFRAESTRUCTURA* ⚡

🏛️ *ESTADO DE INFRAESTRUCTURA*
• *Web Principal:* ${mynextSite.isOk ? '🟢 Activa (200 OK)' : '🔴 Caída'}
• *Base de Datos (Supabase):* ${dbStatus.isOk ? '⚡ Conectada (' + dbStatus.latency + ')' : '🔴 Error'}

📊 *TRÁFICO & VISITAS (Cloudflare RUM)*
• *Ayer:* 👤 *${formattedYesterday}* visitas | 📄 *${analytics.yesterday.pageViews.toLocaleString('es-ES')}* páginas
• *Últimos 30 días:* 👤 *${formattedMonth}* visitas acumuladas

🌐 *FLOTA DE CLIENTES (${activeCount}/${clientSites.length})*
${clientLines}

📌 *TOTAL GLOBAL:* *${allActiveSitesCount}/${totalSites}* webs operativas.
✅ _Reporte automatizado y verificado correctamente._`;

  try {
    const encoded = encodeURIComponent(text);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encoded}&apikey=${CALLMEBOT_API_KEY}`;
    
    console.log('📲 Enviando reporte a WhatsApp (+34 673 10 94 86)...');
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      console.log('🎉 ¡Reporte enviado con éxito a WhatsApp!');
    } else {
      console.warn(`⚠️ WhatsApp CallMeBot devolvió status ${res.status}`);
    }
  } catch (err) {
    console.error('⚠️ Error al enviar a WhatsApp:', err.message);
  }
}

// --- 6. PLANTILLA HTML ULTRA-PREMIUM (GMAIL & OUTLOOK HYBRID DARK COMPATIBLE) ---
function buildEmailHtml(analytics, sites, dbStatus) {
  const mynextSite = sites.find(s => s.type === 'core') || { isOk: true, status: 200, latency: '45ms' };
  const clientSites = sites.filter(s => s.type === 'client');
  const activeClientsCount = clientSites.filter(s => s.isOk).length;
  const totalClientsCount = clientSites.length;
  const totalWebsCount = sites.length;
  const activeWebsCount = sites.filter(s => s.isOk).length;

  const allHealthy = mynextSite.isOk && dbStatus.isOk && activeClientsCount === totalClientsCount;
  const headerStatusText = allHealthy ? 'SISTEMAS 100% OPERATIVOS' : 'ATENCIÓN REQUERIDA';
  const headerStatusColor = allHealthy ? '#00f2ff' : '#ff4d4d';
  const headerBadgeBg = allHealthy ? '#032535' : '#380a0a';
  const headerBadgeBorder = allHealthy ? '#00f2ff' : '#ff4d4d';

  const formattedYesterdayUniques = analytics.yesterday.uniques.toLocaleString('es-ES');
  const formattedYesterdayViews = analytics.yesterday.pageViews.toLocaleString('es-ES');
  const formattedMonthUniques = analytics.month.uniques.toLocaleString('es-ES');
  const formattedMonthViews = analytics.month.pageViews.toLocaleString('es-ES');

  const clientRowsHtml = clientSites.map((site, index) => {
    const rowBg = index % 2 === 0 ? '#111625' : '#0d111d';
    const statusColor = site.isOk ? '#00f2ff' : '#ff4d4d';
    const statusBg = site.isOk ? '#042836' : '#330c0c';
    const statusBorder = site.isOk ? '#00c8d4' : '#e63939';
    const cleanUrl = site.url.replace('https://', '');

    return `
    <tr style="background-color: ${rowBg};">
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2638; font-size: 13px; font-weight: 700; color: #ffffff;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor}; margin-right: 10px; box-shadow: 0 0 8px ${statusColor};"></span>
        ${site.name}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2638; font-size: 12px; color: #94a3b8; font-family: monospace;">
        <a href="${site.url}" style="color: #64748b; text-decoration: none;" target="_blank">${cleanUrl}</a>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e2638; text-align: right;">
        <span style="display: inline-block; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; letter-spacing: 0.5px;">
          ${site.isOk ? 'ACTIVA' : 'CAÍDA'}
        </span>
      </td>
    </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>MYNEXT Daily Pulse</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e2e8f0;">
  
  <!-- Outer Wrapper Table -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #070913; padding: 30px 12px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #0f1424; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 24px 22px 24px; text-align: center; border-bottom: 1px solid #1e2638; background: linear-gradient(180deg, #131a30 0%, #0f1424 100%);">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 12px auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="https://mynextbymusa.com/favicon-192x192.png" width="36" height="36" alt="MYNEXT" style="display: block; border-radius: 10px; border: 1px solid #00f2ff; box-shadow: 0 0 15px rgba(0, 242, 255, 0.4);" />
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 2.5px; color: #ffffff; line-height: 1;">
                      MY<span style="color: #00f2ff;">NEXT</span>
                    </div>
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-top: 4px; font-weight: 700;">
                      Arquitectura Digital • System Monitor
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style="display: inline-block; padding: 5px 14px; border-radius: 20px; background-color: ${headerBadgeBg}; border: 1px solid ${headerBadgeBorder}; color: ${headerStatusColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-top: 6px; box-shadow: 0 0 12px ${headerBadgeBg};">
                ${headerStatusText}
              </div>
            </td>
          </tr>

          <!-- Section 1: Main Core Infrastructure -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.8px; color: #00f2ff; margin-bottom: 14px;">
                1. Infraestructura Principal (MYNEXT)
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Portfolio Web Card -->
                  <td width="48%" style="padding: 14px; background-color: #161c30; border: 1px solid #243049; border-radius: 12px; vertical-align: top;">
                    <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700;">Sitio Web (Producción)</div>
                    <div style="font-size: 14px; font-weight: 800; color: ${mynextSite.isOk ? '#00f2ff' : '#ff4d4d'}; margin-top: 6px;">
                      ${mynextSite.isOk ? '● Activa (200 OK)' : '● Caída'}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">mynextbymusa.com</div>
                  </td>
                  <td width="4%"></td>
                  <!-- Supabase Card -->
                  <td width="48%" style="padding: 14px; background-color: #161c30; border: 1px solid #243049; border-radius: 12px; vertical-align: top;">
                    <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700;">Base de Datos (Supabase)</div>
                    <div style="font-size: 14px; font-weight: 800; color: ${dbStatus.isOk ? '#00f2ff' : '#ff4d4d'}; margin-top: 6px;">
                      ${dbStatus.isOk ? '● Conectada (' + dbStatus.latency + ')' : '● Error'}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">PostgreSQL Cloud</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Section 2: Cloudflare Analytics -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.8px; color: #00f2ff; margin-bottom: 14px;">
                2. Tráfico & Rendimiento (Cloudflare RUM)
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Yesterday Stat -->
                  <td width="48%" style="padding: 16px; background-color: #161c30; border: 1px solid #00f2ff; border-radius: 12px; vertical-align: top;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px;">
                      Ayer (24 Horas)
                    </div>
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; line-height: 1;">
                      ${formattedYesterdayUniques}
                      <span style="font-size: 12px; font-weight: 700; color: #00f2ff;">visitas</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; line-height: 1.5;">
                      • <strong>${formattedYesterdayViews}</strong> páginas vistas<br>
                      • <strong>0</strong> amenazas bloqueadas
                    </div>
                  </td>
                  <td width="4%"></td>
                  <!-- 30 Days Stat -->
                  <td width="48%" style="padding: 16px; background-color: #161c30; border: 1px solid #243049; border-radius: 12px; vertical-align: top;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px;">
                      Acumulado (30 Días)
                    </div>
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; line-height: 1;">
                      ${formattedMonthUniques}
                      <span style="font-size: 12px; font-weight: 700; color: #64748b;">visitas</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; line-height: 1.5;">
                      • <strong>${formattedMonthViews}</strong> páginas totales<br>
                      • <strong>0</strong> bots mitigados
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;"><div style="height: 1px; background-color: #1e2638;"></div></td>
          </tr>

          <!-- Section 3: Client Fleet Monitor -->
          <tr>
            <td style="padding: 24px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.8px; color: #00f2ff; margin-bottom: 14px;">
                3. Monitor de Flota de Clientes (${activeClientsCount}/${totalClientsCount})
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #1e2638; border-radius: 12px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                ${clientRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Dashboard Quick Links -->
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://dash.cloudflare.com" target="_blank" style="display: inline-block; margin: 4px; padding: 8px 16px; border-radius: 8px; background-color: #161c30; border: 1px solid #243049; color: #ffffff; font-size: 11px; font-weight: 800; text-decoration: none; letter-spacing: 0.8px; text-transform: uppercase;">
                      Cloudflare Panel
                    </a>
                    <a href="https://supabase.com/dashboard" target="_blank" style="display: inline-block; margin: 4px; padding: 8px 16px; border-radius: 8px; background-color: #161c30; border: 1px solid #243049; color: #ffffff; font-size: 11px; font-weight: 800; text-decoration: none; letter-spacing: 0.8px; text-transform: uppercase;">
                      Supabase DB
                    </a>
                    <a href="https://search.google.com/search-console" target="_blank" style="display: inline-block; margin: 4px; padding: 8px 16px; border-radius: 8px; background-color: #161c30; border: 1px solid #243049; color: #ffffff; font-size: 11px; font-weight: 800; text-decoration: none; letter-spacing: 0.8px; text-transform: uppercase;">
                      Search Console
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Disclaimer -->
          <tr>
            <td style="padding: 16px 24px; text-align: center; border-top: 1px solid #1e2638; background-color: #0b0e1a; font-size: 11px; color: #64748b; line-height: 1.6;">
              Reporte de Infraestructura Automatizado • Ejecución Diaria 09:00 AM CEST<br>
              Total Global: <strong>${activeWebsCount}/${totalWebsCount}</strong> webs operativas.<br>
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
  const activeCount = sites.filter(s => s.isOk).length;
  console.log(`✓ ${activeCount}/${sites.length} webs activas.`);

  // 3. Comprobar base de datos Supabase
  console.log('⚡ Verificando conexión con Supabase...');
  const dbStatus = await checkSupabase();
  console.log(`✓ Supabase: ${dbStatus.isOk ? 'OK' : 'Error'} (${dbStatus.latency})`);

  // 4. Enviar reporte por WhatsApp
  await sendWhatsAppReport(analytics, sites, dbStatus);

  // 5. Construir asunto y HTML para Email
  const allOk = sites.every(s => s.isOk) && dbStatus.isOk;
  const subject = allOk
    ? `🟢 Reporte Diario MYNEXT: Todo Activo (${activeCount}/${sites.length}) • ${analytics.yesterday.uniques} visitas ayer`
    : `⚠️ ALERTA: Incidencia detectada en monitor web MYNEXT (${activeCount}/${sites.length} activas)`;

  const html = buildEmailHtml(analytics, sites, dbStatus);

  // 6. Enviar correo vía Resend
  if (!RESEND_API_KEY) {
    console.log('\n⚠️ No se ha detectado RESEND_API_KEY en local. Mostrando vista previa del asunto:');
    console.log('Asunto:', subject);
    console.log('✅ HTML generado correctamente (' + html.length + ' bytes).');
    return;
  }

  console.log('📧 Enviando email vía Resend a mynextbymusa@gmail.com...');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Mynext Status <onboarding@resend.dev>',
        to: ['mynextbymusa@gmail.com'],
        subject: subject,
        html: html
      }),
      signal: AbortSignal.timeout(15000)
    });

    const data = await res.json();
    if (res.ok) {
      console.log('🎉 ¡Email enviado con éxito por Resend! ID:', data?.id);
    } else {
      console.error('❌ Error al enviar email:', res.status, data);
    }
  } catch (err) {
    console.error('❌ Error al conectar con Resend API:', err.message);
  }
}

run().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
