/* Server preview lokal untuk folder public/ hasil build.
 *
 *   npm run preview      → http://localhost:8000
 *
 * Mengirim Cache-Control: no-store supaya perubahan file langsung
 * terlihat tanpa hard refresh. Bukan bagian dari deploy Vercel.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'public');
const PORT = Number(process.env.PORT || 8000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    let file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403, { 'Cache-Control': 'no-store' }).end('forbidden');
      return;
    }
    let info = await stat(file).catch(() => null);
    if (info && info.isDirectory()) {
      file = path.join(file, 'index.html');
      info = await stat(file).catch(() => null);
    }
    if (!info) {
      const alt = file + '.html';
      const altInfo = await stat(alt).catch(() => null);
      if (altInfo && altInfo.isFile()) { file = alt; info = altInfo; }
    }
    if (!info || !info.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('<h1>404</h1><p>Halaman tidak ada di public/. Jalankan <b>npm run vercel-build</b> dulu.</p>');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store, max-age=0',
      'Content-Length': body.length
    });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { 'Cache-Control': 'no-store' }).end('error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('preview: http://localhost:' + PORT + ' → ' + ROOT);
});
