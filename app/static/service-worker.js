self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('starfirecad-v1').then(cache => {
      return cache.addAll(['/', '/static/icon.png']);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
