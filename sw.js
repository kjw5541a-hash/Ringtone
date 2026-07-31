// 벨소리 편집대 — Service Worker
// 앱 셸(index.html)을 캐싱해서 오프라인에서도 열 수 있게 해요.
// (ffmpeg 엔진을 더 이상 쓰지 않아서, 대용량 엔진 캐싱 로직은 제거했어요.)

var SHELL_CACHE = 'ringtone-bench-shell-v2';

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event){
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function(resp){
          caches.open(SHELL_CACHE).then(function(cache){ cache.put(event.request, resp.clone()); });
          return resp;
        })
        .catch(function(){ return caches.match(event.request); })
    );
  }
});
