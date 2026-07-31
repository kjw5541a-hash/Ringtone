// 벨소리 편집대 — Service Worker
// 1) 앱 셸(index.html)은 네트워크 우선, 실패 시 캐시로 폴백 (오프라인 지원)
// 2) ffmpeg 엔진 파일(ffmpeg-core.js / .wasm, ~30MB)은 캐시 우선 — 한 번 받으면
//    버전이 고정된 파일이라 절대 바뀌지 않으므로, 이후엔 완전히 로컬에서 즉시 로드됨.

var SHELL_CACHE = 'ringtone-bench-shell-v1';
var ENGINE_CACHE = 'ringtone-bench-engine-v1';

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;

  // ffmpeg 엔진 파일: 캐시 우선 (로컬 ./ffmpeg-core/든 CDN이든 동일하게 적용됨)
  if (url.indexOf('ffmpeg-core') !== -1) {
    event.respondWith(
      caches.open(ENGINE_CACHE).then(function(cache){
        return cache.match(event.request).then(function(cached){
          if (cached) return cached;
          return fetch(event.request).then(function(resp){
            if (resp && resp.ok) cache.put(event.request, resp.clone());
            return resp;
          });
        });
      })
    );
    return;
  }

  // 앱 셸 페이지 이동: 네트워크 우선, 실패하면 캐시로 폴백 (오프라인 대비)
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
