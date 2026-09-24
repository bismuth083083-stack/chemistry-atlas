const CACHE='chemistry-atlas-v16';
const SHELL=[
  './','index.html','lesson-01.html','lesson-02.html','lesson-03.html','lesson-04.html','lesson-05.html','lesson-06.html','lesson-07.html','resonance.html','terms.html','term.html',
  'style.css','content.css','lecture-02.css','term-figures.css','ppt-figures.css','resonance.css',
  'script.js','data/terms.json','data/notes.json',
  'assets/resonance/ppt/formaldehyde.webp','assets/resonance/ppt/acetate.webp',
  'assets/resonance/ppt/nitromethane.webp','assets/resonance/ppt/cation-hybrid.webp',
  'assets/resonance/ppt/major-minor.webp','assets/resonance/ppt/rules.webp',
  'assets/resonance/acetate.webp','assets/resonance/nitromethane.webp',
  'assets/resonance/formaldehyde-allylic.webp','assets/resonance/major-minor.webp',
  'assets/ppt/orbitals.webp','assets/ppt/lewis-examples.webp','assets/ppt/polar-bond.webp',
  'assets/ppt/wohler-urea.webp','assets/terms/orbital.webp','assets/terms/electron-configuration.webp',
  'assets/terms/bond-polarity.webp','assets/terms/ionic-bond.webp','assets/terms/formal-charge.webp',
  'assets/terms/lewis-structure.webp','assets/terms/condensed-formula.webp','assets/terms/skeletal-formula.webp',
  'assets/terms/resonance.webp','assets/terms/intermolecular-forces.webp','assets/terms/hydrogen-bond.webp',
  'assets/terms/orbital-phase-node.webp','assets/terms/hybrid-orbital-basis.webp',
  'assets/terms/vsepr-lewis.webp','assets/terms/protonated-imine.webp',
  'assets/lecture-03/acidity-structure-16.png','assets/lecture-03/lewis-arrows-21.png',
  'assets/lecture-04/iupac-map-08.png','assets/lecture-04/cycloalkane-23.png','assets/lecture-04/polycycles-26.png',
  'assets/terms/acidity-structure.png','assets/terms/acid-base-definitions.png','assets/terms/iupac-map.png',
  'assets/terms/cycloalkane.png','assets/terms/polycycles.png',
  'assets/lecture-05/isomerism-05.png','assets/lecture-05/newman-15.png','assets/lecture-05/butane-21.png',
  'assets/lecture-05/ring-strain-24.png','assets/lecture-05/chair-31.png','assets/lecture-05/substituted-chair-36.png',
  'assets/lecture-05/decalin-39.png','assets/lecture-05/properties-42.png','assets/lecture-05/halogenation-48.png',
  'assets/terms/isomerism.png','assets/terms/newman.png','assets/terms/butane-conformation.png','assets/terms/ring-strain.png',
  'assets/terms/cyclohexane-chair.png','assets/terms/axial-equatorial.png','assets/terms/decalin.png',
  'assets/lecture-07/rate-limiting-step.webp','assets/lecture-07/propane-halogenation-selectivity.webp','assets/lecture-07/hammond-postulate.webp',
  'assets/lecture-07/radical-orbital.webp','assets/lecture-07/radical-stability.webp','assets/lecture-07/radical-inhibitor.webp',
  'assets/lecture-07/intermediate-classes.webp','assets/lecture-07/carbocation-hyperconjugation.webp','assets/lecture-07/carbanion-stability.webp','assets/lecture-07/carbene-structure-reaction.webp',
  'assets/lecture-06/free-radical-chain.webp','assets/lecture-06/further-chlorination.webp',
  'assets/lecture-06/free-energy-equilibrium.webp','assets/lecture-06/bond-enthalpy.webp',
  'assets/lecture-06/arrhenius-distribution.webp','assets/lecture-06/transition-state.webp','assets/lecture-06/reaction-energy.webp',
  'assets/terms/radical-chain.webp','assets/terms/free-energy-equilibrium.webp','assets/terms/bond-enthalpy.webp',
  'assets/terms/arrhenius-distribution.webp','assets/terms/transition-state.webp','assets/terms/reaction-energy.webp'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    try{
      const response=await fetch(event.request);
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone())}
      return response;
    }catch{
      if(cached)return cached;
      if(event.request.mode==='navigate')return (await caches.match('index.html'))||new Response('<h1>暂时离线</h1><p>联网访问一次后即可离线阅读已缓存内容。</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
      return new Response('',{status:503,statusText:'Offline'});
    }
  })());
});
