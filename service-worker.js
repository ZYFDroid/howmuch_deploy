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
  
/**
为 fetch 事件添加一个事件监听器。接下来，使用 caches.match() 函数来检查传入的请求 URL 是否匹配当前缓存中存在的任何内容。如果存在的话，返回缓存的资源。
如果资源并不存在于缓存当中，通过网络来获取资源，并将获取到的资源添加到缓存中。
*/

var fetchHandler = function(event){
  

  event.respondWith(caches.match(event.request).then(
    function(response){
      //不缓存version.js防止版本无法更新
      if(event.request.url.endsWith("version.js")){
        return (fetch(event.request).then(
          function (response) {
            return response;
          }
        ));
      }

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
