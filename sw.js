// QuickCart Service Worker v1.0
const CACHE = 'quickcart-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/submit.html'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(PRECACHE); })
  );
});

self.addEventListener('fetch', function(e){
  // Network-first for Firebase API calls
  if(e.request.url.includes('firebaseio.com') || e.request.url.includes('anthropic.com')){
    return;
  }
  e.respondWith(
    fetch(e.request).catch(function(){
      return caches.match(e.request);
    })
  );
});
