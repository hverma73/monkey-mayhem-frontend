import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist');

const serverModuleUrl = pathToFileURL(path.join(rootDir, '.prerender', 'entry-server.js')).href;
const { PUBLIC_ROUTES, render } = await import(serverModuleUrl);
const publicRoutes = PUBLIC_ROUTES;
const adminPath = (process.env.VITE_ADMIN_PATH || '').replace(/^\/+|\/+$/g, '');
if (!adminPath) throw new Error('VITE_ADMIN_PATH is required');
if (publicRoutes.some((route) => route.startsWith(`/${adminPath}`))) {
  throw new Error('PUBLIC_ROUTES must not include the admin path');
}

const ROUTE_META = {
  '/': { title: 'MMA, Boxing & Muay Thai Gym in Mangaluru (Mangalore) | Monkey Mayhem', description: 'Monkey Mayhem Fight Club in Kadri, Mangaluru offers combat sports and fitness classes with MMA, boxing, Muay Thai, BJJ and yoga.' },
  '/programs': { title: 'Combat Sports Classes in Mangalore – 12 Disciplines | Monkey Mayhem Kadri', description: 'Explore 12 combat sports and fitness disciplines at Monkey Mayhem in Kadri, Mangaluru.' },
  '/batches': { title: 'Class Timetable & Batches – Kadri, Mangaluru | Monkey Mayhem', description: 'Check the weekly training timetable and class batches at Monkey Mayhem in Kadri, Mangaluru.' },
  '/contact': { title: 'Book a Free Trial – Fight Gym in Kadri, Mangaluru | Monkey Mayhem', description: 'Book a free trial at Monkey Mayhem Fight Club in Kadri, Mangaluru.' },
  '/team': { title: 'Coaches & Team | Monkey Mayhem Kadri, Mangaluru', description: 'Meet the coaches and team at Monkey Mayhem Fight Club in Kadri, Mangaluru.' },
  '/achievements': { title: 'Wins & Achievements | Monkey Mayhem Mangaluru', description: 'See the achievements and competitive milestones from Monkey Mayhem Fight Club in Mangaluru.' },
  '/events': { title: 'Events & Open Days | Monkey Mayhem Mangaluru', description: 'Upcoming events, open days and training experiences at Monkey Mayhem in Mangaluru.' },
  '/articles': { title: 'Training Articles & Guides | Monkey Mayhem', description: 'Read beginner guides and training notes from Monkey Mayhem Fight Club in Mangaluru.' },
};

function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function addMeta(html, pathname) {
  const routeMeta = ROUTE_META[pathname] || ROUTE_META['/'];
  const canonical = `https://monkeymayhemfightclub.com${pathname === '/' ? '' : pathname}`;
  return html.replace('</head>', `
    <meta name="description" content="${escapeHtml(routeMeta.description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${canonical}" />
    <title>${escapeHtml(routeMeta.title)}</title>
  </head>`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildSitemap() {
  const urls = publicRoutes.map((path) => {
    const url = `https://monkeymayhemfightclub.com${path === '/' ? '' : path}`;
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function renderRoute(url) {
  return render(url);
}

async function main() {
  const template = fs.readFileSync(path.join(rootDir, 'dist', 'index.html'), 'utf8');
  fs.writeFileSync(path.join(outDir, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://monkeymayhemfightclub.com/sitemap.xml\n');
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemap());

  for (const url of publicRoutes) {
    const html = await renderRoute(url);
    const routeDir = path.join(outDir, url === '/' ? '' : url);
    fs.mkdirSync(routeDir, { recursive: true });
    const markup = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
    const output = addMeta(markup, url);
    fs.writeFileSync(path.join(routeDir, 'index.html'), output);
  }

  const fallback = path.join(outDir, '404.html');
  fs.writeFileSync(
    fallback,
    '<!doctype html><html lang="en-IN"><head><meta charset="utf-8" /><meta name="robots" content="noindex" /><title>Page not found</title></head><body><h1>Page not found</h1></body></html>'
  );

  console.log(`Prerendered ${publicRoutes.length} public routes to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
