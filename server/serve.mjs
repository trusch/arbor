// Arbor static server + client telemetry sink. No dependencies.
// Serves dist/ and appends POST /log bodies (JSON object, array, or JSON lines)
// to logs/client.jsonl, each record stamped with server time, UA and remote IP.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const logDir = path.join(root, 'logs');
const logFile = path.join(logDir, 'client.jsonl');
const HOST = process.env.HOST ?? '10.77.0.2';
const PORT = Number(process.env.PORT ?? 8050);
const MAX_BODY = 256 * 1024;
fs.mkdirSync(logDir, { recursive: true });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
};

function handleLog(req, res) {
  let size = 0;
  const chunks = [];
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY) { res.writeHead(413).end(); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    if (size > MAX_BODY) return;
    const text = Buffer.concat(chunks).toString('utf8').trim();
    const recs = [];
    const push = (o) => recs.push(o && typeof o === 'object' && !Array.isArray(o) ? o : { raw: o });
    try {
      const j = JSON.parse(text);
      Array.isArray(j) ? j.forEach(push) : push(j);
    } catch {
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        try { push(JSON.parse(line)); } catch { push(line.slice(0, 2000)); }
      }
    }
    const meta = { srv_ts: new Date().toISOString(), ua: req.headers['user-agent'] ?? '', ip: req.socket.remoteAddress };
    const out = recs.map((r) => JSON.stringify({ ...meta, ...r })).join('\n');
    if (out) fs.appendFile(logFile, out + '\n', () => {});
    res.writeHead(204, { 'access-control-allow-origin': '*' }).end();
  });
}

function serveStatic(req, res) {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  // /diag serves diag.html directly (its ./ links resolve to the app); /diag/ would break them, so redirect.
  if (p === '/diag/') { res.writeHead(302, { location: '/diag.html' }).end(); return; }
  if (p === '/diag') p = '/diag.html';
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dist, path.normalize(p));
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403).end(); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/plain' }).end('not found'); return; }
    const ext = path.extname(file);
    const headers = { 'content-type': TYPES[ext] ?? 'application/octet-stream', 'content-length': st.size };
    // HTML must never be cached so a fresh deploy (and new telemetry) reaches the phone; hashed assets can be.
    headers['cache-control'] = ext === '.html' ? 'no-store' : 'public, max-age=3600';
    res.writeHead(200, headers);
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer((req, res) => {
  if (req.url.startsWith('/log')) {
    if (req.method === 'POST') return handleLog(req, res);
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' }).end(); return; }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  serveStatic(req, res);
}).listen(PORT, HOST, () => console.log(`arbor serving ${dist} on http://${HOST}:${PORT}/ (log → ${logFile})`));
