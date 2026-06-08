/**
 * Service Worker - 高德地图瓦片离线缓存
 * 拦截瓦片请求，缓存到本地，离线时从缓存读取
 */
const CACHE_NAME = 'amap-tiles-v1';
const TILE_URLS = [
  'is.autonavi.com',       // 高德瓦片 CDN
  'amap-app-nine.vercel.app', // Vercel 代理
];

// 安装时：跳过等待，立即激活
self.addEventListener('install', () => self.skipWaiting());

// 激活时：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 拦截请求：瓦片图片优先从缓存读取
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  // 只缓存瓦片图片请求
  if (!isTileRequest(url)) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        if (cached) return cached; // 缓存命中
        return fetch(e.request).then(res => {
          if (res.ok && res.status === 200) {
            // 异步缓存，不阻塞响应
            const clone = res.clone();
            cache.put(e.request, clone).catch(() => {});
          }
          return res;
        }).catch(() => {
          // 离线且无缓存：返回空白
          return new Response('', { status: 200, headers: { 'Content-Type': 'image/png' } });
        });
      })
    )
  );
});

function isTileRequest(url) {
  try {
    const u = new URL(url);
    // 匹配 tile 相关路径
    if (u.pathname.includes('/tile')) return true;
    if (u.pathname.match(/\/appmaptile/)) return true;
    // 匹配 TILE_URLS 中的域名
    return TILE_URLS.some(d => u.hostname.includes(d));
  } catch(e) { return false; }
}
