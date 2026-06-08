/**
 * 高德瓦片代理 — 带缓存，速度飞起
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const PORT = 8080;

const STYLES = {
  normal:          { url: 'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8', maxZoom: 20 },
  hd:              { url: 'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8', maxZoom: 20 },
  satellite:       { url: 'https://webst{s}.is.autonavi.com/appmaptile?style=6',                         maxZoom: 18 },
  'satellite-label': { url: 'https://webst{s}.is.autonavi.com/appmaptile?style=7',                       maxZoom: 18 },
};
const SUBS = ['01', '02', '03', '04'];

// ===== 瓦片缓存 (LRU, 最多 500 张) =====
class TileCache {
  constructor(max=500) { this.max = max; this.map = new Map(); }
  get(k) {
    if (!this.map.has(k)) return null;
    const v = this.map.get(k);
    this.map.delete(k); this.map.set(k, v); // LRU bump
    return v;
  }
  set(k, v) {
    if (this.map.size >= this.max) { const first = this.map.keys().next().value; this.map.delete(first); }
    this.map.set(k, v);
  }
}
const cache = new TileCache();

function parseTileParams(u) {
  const m1 = u.pathname.match(/\/tile\/(\d+)\/(\d+)\/(\d+)/);
  if (m1) return { z: +m1[1], x: +m1[2], y: +m1[3], style: u.searchParams.get('style') || 'hd' };
  const p = u.searchParams;
  let x = p.get('x') || p.get('X') || p.get('col') || p.get('tileX');
  let y = p.get('y') || p.get('Y') || p.get('row') || p.get('tileY');
  let z = p.get('z') || p.get('Z') || p.get('zoom') || p.get('level') || p.get('tileZ');
  let style = p.get('style') || p.get('type') || p.get('t') || 'hd';
  if (x && (x.includes('{') || x.includes('$'))) x = null;
  if (y && (y.includes('{') || y.includes('$'))) y = null;
  if (z && (z.includes('{') || z.includes('$'))) z = null;
  if (x && y && z) return { x: +x, y: +y, z: +z, style };
  return null;
}

function fetchTile(style, z, x, y, res) {
  const cfg = STYLES[style];
  if (!cfg) { res.writeHead(400); res.end('Invalid style'); return; }

  const cacheKey = `${style}:${z}:${x}:${y}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': cached.length,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Cache': 'HIT',
    });
    res.end(cached);
    return;
  }

  const sub = SUBS[(x + y + z) % SUBS.length];
  const tileUrl = cfg.url.replace('{s}', sub) + `&x=${x}&y=${y}&z=${z}`;

  if (z > cfg.maxZoom) {
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public,max-age=86400' });
    res.end(); return;
  }

  const u = new URL(tileUrl);
  const chunks = [];
  const req = https.request({
    hostname: u.hostname, path: u.pathname + u.search, method: 'GET',
    headers: {
      'Referer': 'https://ditu.amap.com/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; T100) AppleWebKit/537.36',
      'Accept': 'image/png,image/*,*/*',
    },
  }, (tileRes) => {
    tileRes.on('data', c => chunks.push(c));
    tileRes.on('end', () => {
      const buf = Buffer.concat(chunks);
      if (tileRes.statusCode === 200 && buf.length > 100) {
        cache.set(cacheKey, buf); // 只缓存有效瓦片
      }
      const h = {
        'Content-Type': tileRes.headers['content-type'] || 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': buf.length,
      };
      res.writeHead(tileRes.statusCode, h);
      res.end(buf);
    });
  });
  req.on('error', (e) => { console.error('Tile error:', e.message); res.writeHead(502); res.end('Error'); });
  req.setTimeout(8000, () => { req.destroy(); res.writeHead(504); res.end('Timeout'); });
  req.end();
}

const HOME = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>高德瓦片服务</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
body{background:#0a0e1a;color:#e8ecf4;padding:20px;max-width:700px;margin:auto;line-height:1.7;}
h1{font-size:22px;background:linear-gradient(135deg,#1a73e8,#4fc3f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;}
h2{font-size:16px;color:#4fc3f7;margin:24px 0 8px;}
code{background:rgba(255,255,255,0.07);padding:2px 10px;border-radius:4px;font-family:monospace;font-size:13px;color:#4fc3f7;word-break:break-all;}
.box{background:rgba(26,115,232,0.1);border:1px solid rgba(26,115,232,0.2);border-radius:10px;padding:14px;margin:8px 0;}
.box code{display:block;padding:10px;margin:4px 0;background:rgba(0,0,0,0.3);font-size:13px;}
.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-right:6px;}
.t-hd{background:#ff6f00;}
.t-sat{background:#34a853;}
a{color:#4fc3f7;}
</style>
</head>
<body>
<h1>🗺️ 高德瓦片服务</h1>
<p>为 DJI T100 提供高德高清地图瓦片。<br/>首次加载后自动缓存，后续请求瞬间返回。</p>

<h2>🚁 填入 T100</h2>
<div class="box">
<div><span class="tag t-hd">推荐</span> 高清矢量</div>
<code id="u1">https://current-host/tile?x={x}&y={y}&z={z}&style=hd</code>
</div>
<div class="box"><span class="tag t-sat">卫星</span>
<code id="u2">https://current-host/tile?x={x}&y={y}&z={z}&style=satellite</code>
</div>
<p style="color:#8892b0;font-size:13px;">首次打开稍慢（加载缓存），之后极快。</p>
<p style="margin-top:16px;"><a href="/app.html">🗺️ 网页版航点工具</a></p>
<script>
['u1','u2'].forEach(id => {
  const el = document.getElementById(id);
  el.textContent = el.textContent.replace('https://current-host', location.origin);
});
</script>
</body>
</html>`;

// ===== Server =====
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');

  if (u.pathname.startsWith('/tile')) {
    const params = parseTileParams(u);
    if (!params) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`无法解析参数\n收到: ${req.url}\n\n支持的格式:\n/tile?x={x}&y={y}&z={z}&style=hd\n/tile/{z}/{x}/{y}?style=hd`);
      return;
    }
    fetchTile(params.style, params.z, params.x, params.y, res);
    return;
  }

  if (u.pathname === '/' || u.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HOME); return;
  }

  let fp = path.join(__dirname, u.pathname);
  fp = path.normalize(fp);
  if (!fp.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(fp);
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css' };
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  🗺️  高德瓦片服务 · 端口 ${PORT}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  首页:    http://localhost:${PORT}`);
  console.log(`  瓦片:    http://localhost:${PORT}/tile?x={x}&y={y}&z={z}&style=hd`);
  console.log(`  网页版:  http://localhost:${PORT}/app.html`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  ✅ 自动缓存瓦片，重复请求瞬间返回`);
  console.log(`  ✅ 网页版瓦片直连高德 CDN（不经过隧道）`);
});
