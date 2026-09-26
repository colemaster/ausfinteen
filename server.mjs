import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

// Hashed assets (e.g. _astro/*.js) can be cached forever
const IMMUTABLE_RE = /\/_astro\/|\.[\da-f]{8,}\./;
// Compressible content types
const COMPRESSIBLE_RE = /^(text\/|application\/json|application\/javascript|application\/manifest|image\/svg)/;

function checkPort(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => {
      s.close(() => resolve(true));
    });
    s.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < 65000; port++) {
    const ok = await checkPort(port);
    if (ok) return port;
  }
  return 0;
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(DIST, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else {
      filePath = path.join(DIST, '404.html');
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  // Performance: set aggressive caching for hashed assets
  const headers = { 'Content-Type': contentType };
  if (IMMUTABLE_RE.test(urlPath)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  } else {
    headers['Cache-Control'] = 'public, max-age=3600';
  }

  // Security headers
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['X-Frame-Options'] = 'DENY';
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // Performance: Brotli/gzip compression for compressible content
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE_RE.test(contentType)) {
    if (acceptEncoding.includes('br')) {
      headers['Content-Encoding'] = 'br';
      headers['Vary'] = 'Accept-Encoding';
      res.writeHead(200, headers);
      fs.createReadStream(filePath)
        .pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }))
        .pipe(res);
      return;
    } else if (acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(zlib.createGzip({ level: 6 })).pipe(res);
      return;
    }
  }

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
});

const PORT = parseInt(process.env.PORT || '48000', 10);
server.listen(PORT, '0.0.0.0', () => {
  const activePort = server.address().port;
  console.log(`\n  🚀 AusFinance Suite Frontend Server Ready!`);
  console.log(`  ➜ Local:   http://localhost:${activePort}/`);
  console.log(`  ➜ Network: http://0.0.0.0:${activePort}/`);
  console.log(`  ➜ Features: Brotli/Gzip compression, immutable asset caching\n`);
});
