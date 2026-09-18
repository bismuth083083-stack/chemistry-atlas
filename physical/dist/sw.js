const CACHE='chemistry-atlas-v4';
const SHELL=['./','index.html','lesson-01.html','lesson-02.html','lesson-03.html','lesson-04.html','terms.html','term.html','style.css','content.css','pchem.css','math.css','script.js','qa.js','qa.css','data/terms.json','data/notes.json','assets/pchem-scope.png','assets/math-relations.png','assets/pvt-surface.png','assets/molecular-interactions.png','assets/compression-factor.png','assets/condensation-isotherms.png','assets/vdw-loops.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  event.respondWith((async()=>{const cached=await caches.match(event.request);try{const response=await fetch(event.request);if(response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone())}return response}catch{if(cached)return cached;if(event.request.mode==='navigate')return (await caches.match('index.html'))||new Response('<h1>暂时离线</h1><p>联网访问一次后即可离线阅读已缓存内容。</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});return new Response('',{status:503,statusText:'Offline'})}})());
});
