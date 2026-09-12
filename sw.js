const CACHE_NAME = 'mya-const-hub-v2.0';

// Offline အသုံးပြုရန် Cache လုပ်ထားမည့် File များ
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Padauk:wght@400;700&display=swap'
];

// Service Worker တပ်ဆင်ခြင်း
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Cache သက်တမ်းကုန်/အဟောင်းများကို ရှင်းလင်းခြင်း
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network / Offline Cache ရယူသုံးစွဲမှု စီမံခြင်း (Cache First, Fallback to Network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // သုံးစွဲသူ ရယူလိုက်သော Network Data အသစ်ကို Cache ထဲသို့ ထပ်မံသိမ်းဆည်းခြင်း
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline ဖြစ်ပြီး Cache မရှိပါက ပြသရန် Fallback
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
