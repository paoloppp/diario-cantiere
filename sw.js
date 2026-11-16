// Diario Cantiere — funzionamento offline
const CACHE='diario-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{mode:u.startsWith('http')?'cors':'same-origin'})).catch(()=>{}))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  // pagina: prima la rete (per gli aggiornamenti), se non c'è campo la copia salvata
  if(req.mode==='navigate'){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put('./index.html',c)); return r; })
      .catch(()=>caches.match('./index.html')));
    return;
  }
  // resto (librerie, font, icone): prima la copia salvata
  if(url.origin===location.origin || /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r.ok||r.type==='opaque'){ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req,c)); } return r; })));
  }
});
