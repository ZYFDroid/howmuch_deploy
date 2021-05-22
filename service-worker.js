var cacheName = 'howmuch_v1'; 
self.addEventListener('install', event => { 
  caches.delete("howmuch_v1").then((f)=>console.log(f));
  event.waitUntil(
    caches.open(cacheName)                  
    .then(cache => cache.addAll([      
      'js/common.js',
      'lib/jquery-3.6.0.js',
      'lib/sweetalert.min.js',
      'lib/vue.js',
      'css/style.css'
    ]))
  );
});
  

var fetchHandler = function(event){

  //不缓存version.js防止版本无法更新
  if(event.request.url.endsWith("version.js")){
    event.respondWith(fetch(event.request).then(
      function (response) {
        return response;
      }
    ));
    return;
  }

  event.respondWith(caches.match(event.request).then(
    function(response){
      if(response){
        return response;
      }
      var requestToCache = event.request.clone();
      return fetch(requestToCache).then(
        function (response) {
          if (!response || response.status !== 200) {
            return response;
          }
          var responseToCache = response.clone();
          caches.open(cacheName)
            .then(function (cache) {
              cache.put(requestToCache, responseToCache);
            });
          return response;
        }
      );             
    }
  ));
}

self.addEventListener('fetch',fetchHandler);
