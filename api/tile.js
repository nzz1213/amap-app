/**
 * 高德瓦片代理 — Vercel Serverless 版
 * 
 * 使用方式（填入 DJI T100 自定义地图源）:
 *   https://your-domain.vercel.app/tile?x={x}&y={y}&z={z}&style=hd
 * 
 * 支持 styles: hd, normal, satellite, satellite-label
 */
const https = require('https');

const TILES = {
  normal:          'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8',
  hd:              'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8',
  satellite:       'https://webst{s}.is.autonavi.com/appmaptile?style=6',
  'satellite-label': 'https://webst{s}.is.autonavi.com/appmaptile?style=7',
};

const SUBS = ['01', '02', '03', '04'];
const MAX_ZOOM = { normal: 20, hd: 20, satellite: 18, 'satellite-label': 18 };

module.exports = async (req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { x, y, z, style } = req.query;

  if (!x || !y || z === undefined) {
    res.status(400).send('Missing params. Usage: /tile?x={x}&y={y}&z={z}&style=hd');
    return;
  }

  const styleName = style || 'hd';
  const tileUrlTemplate = TILES[styleName];
  if (!tileUrlTemplate) {
    res.status(400).send(`Invalid style "${styleName}". Supported: ${Object.keys(TILES).join(', ')}`);
    return;
  }

  const maxZ = MAX_ZOOM[styleName] || 20;
  const zoom = parseInt(z);
  if (zoom > maxZ) {
    // 超过最大缩放，返回空白
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).end();
    return;
  }

  const sub = SUBS[(parseInt(x) + parseInt(y) + zoom) % SUBS.length];
  const tileUrl = tileUrlTemplate.replace('{s}', sub) + `&x=${x}&y=${y}&z=${z}`;

  try {
    const buf = await fetchTile(tileUrl);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'MISS');
    res.status(200).send(buf);
  } catch (err) {
    console.error('Tile error:', err.message);
    res.status(502).send('Tile fetch failed');
  }
};

function fetchTile(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          Referer: 'https://ditu.amap.com/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; T100) AppleWebKit/537.36',
          Accept: 'image/png,image/*,*/*',
        },
      },
      (tileRes) => {
        const chunks = [];
        tileRes.on('data', (c) => chunks.push(c));
        tileRes.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (tileRes.statusCode !== 200 || buf.length < 100) {
            resolve(Buffer.alloc(0)); // 无效瓦片，返回空白
          } else {
            resolve(buf);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}
