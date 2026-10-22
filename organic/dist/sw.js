const CACHE='chemistry-atlas-v24-org13';
const SHELL=[
'lesson-13.html','org13.css','assets/lecture-13/dehydrohalogenation.webp','assets/lecture-13/zaitsev-stereospecificity.webp','assets/lecture-13/dihalide-elimination.webp','assets/lecture-13/organometallic-wurtz-grignard.webp','assets/lecture-13/grignard-reactivity.webp','assets/lecture-13/allylic-bromination.webp','assets/lecture-13/allylic-resonance.webp','assets/lecture-13/nbs-mechanism.webp','assets/lecture-13/exercise-activity.webp','assets/lecture-13/exercise-products.webp','assets/lecture-13/homework-6-9-6-72.webp',
'lesson-12.html','org12.css','assets/lecture-12/e1-mechanism.webp','assets/lecture-12/e1-energy.webp','assets/lecture-12/hydride-shift.webp','assets/lecture-12/ring-expansion.webp','assets/lecture-12/methyl-shift.webp','assets/lecture-12/e2-mechanism.webp','assets/lecture-12/butene-ratios.webp','assets/lecture-12/cyclic-products.webp','assets/lecture-12/anti-periplanar.webp','assets/lecture-12/syn-elimination.webp','assets/lecture-12/stereo-e.webp','assets/lecture-12/stereo-z.webp','assets/lecture-12/e1-e2-comparison.webp','assets/lecture-12/worked-cyclic.webp','assets/lecture-12/worked-secondary.webp','assets/lecture-12/homework.webp',
'lesson-11.html','org11.css','assets/lecture-11/leaving-groups.webp','assets/lecture-11/steric-rates.webp','assets/lecture-11/neopentyl.webp','assets/lecture-11/backside-orbital.webp','assets/lecture-11/walden-inversion.webp','assets/lecture-11/fischer-example.webp','assets/lecture-11/sn1-mechanism.webp','assets/lecture-11/sn1-energy.webp','assets/lecture-11/resonance-stabilization.webp','assets/lecture-11/solvent-rates.webp','assets/lecture-11/ion-pair.webp','assets/lecture-11/hydride-shift.webp','assets/lecture-11/hydride-capture.webp','assets/lecture-11/methyl-shift.webp','assets/lecture-11/methyl-capture.webp','assets/lecture-11/comparison.webp','assets/lecture-11/homework.webp',
  './','index.html','lesson-01.html','lesson-02.html','lesson-03.html','lesson-04.html','lesson-05.html','lesson-06.html','lesson-07.html','lesson-08.html','lesson-09.html','lesson-10.html','resonance.html','terms.html','term.html',
  'style.css','content.css','lecture-02.css','term-figures.css','ppt-figures.css','resonance.css','custom.css',
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
  'assets/terms/arrhenius-distribution.webp','assets/terms/transition-state.webp','assets/terms/reaction-energy.webp',
  'assets/lecture-08/chirality-hands.webp','assets/lecture-08/enantiomer-mirror.webp','assets/lecture-08/superimposable-test.webp',
  'assets/lecture-08/tetrahedral-four-groups.webp','assets/lecture-08/bromobutane-enantiomers.webp',
  'assets/lecture-08/methylcyclohexane-plane.webp','assets/lecture-08/methylcyclohexanone-chiral.webp',
  'assets/lecture-08/butane-conformational-chirality.webp','assets/lecture-08/allene-chirality.webp',
  'assets/lecture-08/rs-rotation-rule.webp',
  'assets/lecture-08/structures/og08-001-S-alanine-neutral.png','assets/lecture-08/structures/og08-002-R-alanine-neutral.png',
  'assets/lecture-08/structures/og08-003-S-2-bromobutane-neutral.png','assets/lecture-08/structures/og08-004-R-2-bromobutane-neutral.png',
  'assets/lecture-08/structures/og08-005-S-13-dibromobutane-neutral.png','assets/lecture-08/structures/og08-006-R-13-dibromobutane-neutral.png',
  'assets/lecture-08/structures/og08-007-R-carvone-neutral.png','assets/lecture-08/structures/og08-008-S-carvone-neutral.png',
  'assets/lecture-08/structures/og08-009-cis-13-dimethylcyclopentane-neutral.png',
  'assets/lecture-08/structures/og08-010-trans-13-dimethylcyclopentane-1S3S-neutral.png',
  'assets/lecture-08/structures/og08-011-trans-13-dimethylcyclopentane-1R3R-neutral.png',
  'assets/lecture-08/structures/og08-013-methylcyclohexane-neutral.png','assets/lecture-08/structures/og08-014-R-2-methylcyclohexanone-neutral.png',
  'assets/lecture-09/absolute-relative-config.webp','assets/lecture-09/achiral-synthesis.webp','assets/lecture-09/chemical-resolution.webp','assets/lecture-09/chromatographic-resolution.webp','assets/lecture-09/cis-trans-diastereomers.webp','assets/lecture-09/dextro-levo.webp','assets/lecture-09/diastereomer-properties.webp','assets/lecture-09/diastereomer-two-centers.webp','assets/lecture-09/diastereomeric-salts-2.webp','assets/lecture-09/diastereomeric-salts.webp','assets/lecture-09/dl-system.webp','assets/lecture-09/ee-calculation.webp','assets/lecture-09/enantiomer-properties.webp','assets/lecture-09/fischer-chirality-cases.webp','assets/lecture-09/fischer-definition.webp','assets/lecture-09/fischer-direct-rs.webp','assets/lecture-09/fischer-interchange.webp','assets/lecture-09/fischer-mirror-test.webp','assets/lecture-09/fischer-rules-180-vs-90.webp','assets/lecture-09/inactive-reactants.webp','assets/lecture-09/meso-compound.webp','assets/lecture-09/optical-activity.webp','assets/lecture-09/optical-purity.webp','assets/lecture-09/plane-polarized-light.webp','assets/lecture-09/polarimeter.webp','assets/lecture-09/polarimetry-setup.webp','assets/lecture-09/racemic-mixture.webp','assets/lecture-09/racemization-carbocation.webp','assets/lecture-09/racemization-enol.webp','assets/lecture-09/resolution.webp','assets/lecture-09/specific-rotation-example.webp','assets/lecture-09/specific-rotation.webp','assets/lecture-09/stereoisomer-tree.webp','assets/lecture-09/thalidomide.webp','assets/lecture-09/two-n-rule.webp'
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



