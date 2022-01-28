const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  './manifest.json',
  './index.html',
  './js/index.js',
  './css/styles.css',
];

// Install the service worker
self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('Your files were pre-cached successfully!');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });

  self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log('Removing old cache data', key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

  self.addEventListener('fetch', function(e) {
    if (evt.request.url.includes('/api/')) {
      e.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(e.request)
              .then(response => {
                if (response.status === 200) {
                  cache.put(e.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                return cache.match(e.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request).then(function(response) {
          if (response) {
            return response;
          } else if (e.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
    );
  });