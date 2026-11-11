// Service Worker: App offline verfügbar machen
const VERSION = 'v2';
const APP_CACHE = 'kamu-app-' + VERSION;
const MODEL_CACHE = 'kamu-ki-modell';   // bleibt über Updates hinweg erhalten
const APP_FILES = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/app.js', 'js/render.js', 'js/db.js', 'js/pin.js', 'js/imagetools.js', 'js/segment.bundle.js',
  'assets/logo-werkstatt.png', 'assets/logo-parts.png', 'assets/bg-werkstatt.jpg', 'assets/bg-teile.jpg',
  'assets/fonts/InterDisplay-Medium.otf', 'assets/fonts/InterDisplay-SemiBold.otf', 'assets/fonts/InterDisplay-Bold.otf',
  'assets/fonts/InterDisplay-Black.otf', 'assets/fonts/InterDisplay-ExtraBoldItalic.otf', 'assets/fonts/InterDisplay-BlackItalic.otf',
  'icons/icon-192.png', 'icons/icon-512.png', 'bg/resources.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP_CACHE).then(c => c.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('kamu-app-') && k !== APP_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // KI-Modell-Teile: einmal laden, dann dauerhaft aus dem Speicher
  if (url.pathname.includes('/bg/') && !url.pathname.endsWith('resources.json')) {
    e.respondWith(caches.open(MODEL_CACHE).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  // App-Dateien: zuerst Netz (für Updates), sonst Speicher
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(APP_CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
