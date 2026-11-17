// Offline cache + cross-origin isolation (lets the AI run multi-threaded). Models are cached by Transformers.js itself.
const C='p3d-2',CDN=['cdn.jsdelivr.net','storage.googleapis.com'];
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k.startsWith('p3d-')&&k!==C)await caches.delete(k);
  await clients.claim()})()));
const iso=r=>{const h=new Headers(r.headers);h.set('Cross-Origin-Embedder-Policy','credentialless');h.set('Cross-Origin-Opener-Policy','same-origin');
  return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h})};
self.addEventListener('fetch',e=>{
  const q=e.request,u=new URL(q.url),own=u.origin===location.origin,nav=own&&q.mode==='navigate';
  if(q.method!=='GET'||q.headers.has('range')||!(own||CDN.includes(u.hostname)))return;
  e.respondWith((async()=>{
    const c=await caches.open(C);
    if(!own){const m=await c.match(q);if(m)return m}          // versioned CDN files: cache first
    try{const r=await fetch(q);if(r.ok)c.put(q,r.clone());return nav?iso(r):r}
    catch(err){const m=await c.match(q);return m?(nav?iso(m):m):Response.error()}})())});
