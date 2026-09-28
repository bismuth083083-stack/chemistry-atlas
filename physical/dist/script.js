const root=document.body;
const theme=document.querySelector('#theme');
const saved=localStorage.getItem('ochem-theme');
if(saved==='light')root.classList.add('light');
theme?.addEventListener('click',()=>{root.classList.toggle('light');localStorage.setItem('ochem-theme',root.classList.contains('light')?'light':'dark')});
const globalSearch=document.querySelector('#global-search');
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();globalSearch?.focus()}});
globalSearch?.addEventListener('keydown',e=>{if(e.key==='Enter'&&globalSearch.value.trim())location.href='terms.html?q='+encodeURIComponent(globalSearch.value.trim())});
const termSearch=document.querySelector('#term-search');
const query=new URLSearchParams(location.search).get('q');
if(termSearch&&query)termSearch.value=query;
async function getTerms(){const r=await fetch('data/terms.json');return r.json()}
function termRow(t){return `<a class="term-table row" href="term.html?slug=${encodeURIComponent(t.slug)}"><strong>${t.zh}</strong><span>${t.en}</span><span>${t.category}</span><span>${t.related.length}</span></a>`}
async function loadTerms(){const terms=await getTerms();const list=document.querySelector('#term-list');document.querySelector('#term-count').textContent=terms.length;const render=()=>{const q=(termSearch?.value||'').trim().toLowerCase();const shown=terms.filter(t=>[t.zh,t.en,t.category,...(t.properties||[])].join(' ').toLowerCase().includes(q));list.className=shown.length?'':'table-empty';list.innerHTML=shown.length?shown.map(termRow).join(''):'<b>没有匹配词条</b><p>尝试中文名、英文名或分类。</p>'};termSearch?.addEventListener('input',render);render()}
const TERM_IMAGES={
  'second-law':['lecture-07/clausius-refrigerator.webp','第二定律两种表述对应的不可能过程与可行过程：左图热由低温流向高温且无功耗，违反第二定律；右图有外部功输入，可行','PChem1 lec78 2nd Law1，第 3 页'],
  'heat-engine':['lecture-07/heat-engine.webp','热机从高温热源吸热，一部分转化为功，其余排入低温热源','PChem1 lec78 2nd Law1，第 2 页'],
  'heat-engine-efficiency':['lecture-07/heat-engine-accounting.webp','热机循环的能量记账：吸热 +20、做功 5、排热 −15，三者满足 q_h + q_c = −w，效率小于 1','PChem1 lec78 2nd Law1，第 10 页'],
  'reservoir':['lecture-07/heat-engine-accounting.webp','高温热源与低温热源作为热库：温度均匀且不因吸放热而改变','PChem1 lec78 2nd Law1，第 10 页'],
  'refrigerator':['lecture-07/clausius-refrigerator.webp','制冷机必须消耗功才能把热由低温热源搬到高温热源，故不违反第二定律','PChem1 lec78 2nd Law1，第 3 页'],
  'spontaneous-change':['lecture-07/entropy-maximum.webp','孤立体系的熵随时间单调增加，在平衡到达时达到最大值','PChem1 lec78 2nd Law1，第 17 页'],
  'entropy':['lecture-07/carnot-collection.webp','任意可逆循环可用密排的小 Carnot 循环逼近，内部互相抵消，由此证明 ∮dq_r/T = 0，熵是状态函数','PChem1 lec78 2nd Law1，第 13 页'],
  'boltzmann-formula':['lecture-07/third-law-crystal.webp','第三定律的分子论据：0 K 时完美晶体只有一种排布，故 S = k ln W 给出熵为零','PChem1 lec78 2nd Law1，第 34 页'],
  'carnot-cycle':['lecture-07/carnot-cycle-pv.webp','Carnot 循环的 p–V 图：两条等温线与两条绝热线，顶点 A、B、C、D','PChem1 lec78 2nd Law1，第 12 页'],
  'carnot-principle':['lecture-07/carnot-two-engines.webp','两台可逆热机 A（正转）与 B（反转）耦合于同一对热源，用于反证 Carnot 原理','PChem1 lec78 2nd Law1，第 10 页'],
  'clausius-inequality':['lecture-07/reversible-irreversible.webp','由可逆返回路径 R 与不可逆路径 IR 组成不可逆循环，据此推出 dS ≥ dq/T','PChem1 lec78 2nd Law1，第 15 页'],
  'entropy-of-mixing':['lecture-07/entropy-summary-map.webp','熵变计算总图，含混合熵 ΔS_mix = −nR Σ X_B ln X_B','PChem1 lec78 2nd Law1，第 40 页'],
  'trouton-rule':['lecture-07/trouton-rule.webp','Trouton 规则及多种液体的标准汽化熵数据表，水与甲烷是例外','PChem1 lec78 2nd Law1，第 31 页'],
  'third-law':['lecture-07/third-law-crystal.webp','第三定律：0 K 时热运动被冻结、完美晶体只有一种排布，熵为零','PChem1 lec78 2nd Law1，第 34 页'],
  'standard-molar-entropy':['lecture-07/entropy-temperature-curve.webp','由 C_p/T 曲线下面积与各相变熵求 S(T)：熵随温度单调增加并在熔点、沸点处跃升','PChem1 lec78 2nd Law1，第 32 页'],
  'physical-chemistry':['pchem-scope.png','物理化学的研究范围：连接宏观描述、微观描述与统计力学','PChem1 第 1 课课件，第 2 页'],
  'thermodynamics':['thermodynamics-map.png','热力学关系总图：由功、内能与焓出发连接内压、热容与各类过程','PChem1 第 5—6 课课件，关系总图'],
  'chemical-kinetics':['pchem-scope.png','物理化学的分支构成，化学动力学研究速率、机理与催化','PChem1 第 1 课课件，第 2 页'],
  'statistical-mechanics':['pchem-scope.png','物理化学的分支构成，统计力学由微观粒子行为推导宏观性质','PChem1 第 1 课课件，第 2 页'],
  'quantum-chemistry':['pchem-scope.png','物理化学的分支构成，量子化学描述原子结构、化学键与光谱','PChem1 第 1 课课件，第 2 页'],
  'state-function':['thermodynamics-map.png','以状态函数为核心的热力学关系总图','PChem1 第 5—6 课课件，关系总图'],
  'total-differential':['math-relations.png','全微分、混合偏导与欧拉循环关系','PChem1 第 1 课课件，第 9 页'],
  'euler-chain-relation':['math-relations.png','欧拉循环关系与全微分的几何含义','PChem1 第 1 课课件，第 9 页'],
  'perfect-gas':['pvt-surface.png','理想气体的 p–V–T 状态面及等温、等压、等容截面','Atkins, Topic 1A, Fig. 1A.6–1A.7'],
  'equation-of-state':['pvt-surface.png','状态方程所描述的压力—体积—温度状态面','Atkins, Topic 1A, Fig. 1A.6–1A.7'],
  'compression-factor':['compression-factor.png','多种气体在零摄氏度时压缩因子随压力的变化曲线','PChem1 第 2 课课件，第 19 页'],
  'virial-coefficient':['compression-factor.png','Z–p 曲线在低压区的斜率反映第二维里系数','PChem1 第 2 课课件，第 19 页'],
  'boyle-temperature':['compression-factor.png','Z–p 曲线与 Z = 1 相切处对应的温度即 Boyle 温度','PChem1 第 2 课课件，第 19 页'],
  'critical-point':['condensation-isotherms.png','二氧化碳不同温度下的实验等温线与气液共存平台，临界点处平台消失','PChem1 第 2 课课件，第 23 页'],
  'van-der-waals-equation':['vdw-loops.png','van der Waals 方程给出的回线','PChem1 第 2 课课件，第 28 页'],
  'maxwell-construction':['vdw-loops.png','Maxwell 等面积构造：用水平线按上下面积相等确定共存压力','PChem1 第 2 课课件，第 28 页'],
  'internal-energy':['thermodynamics-map.png','热力学关系总图中内能所处的位置及其与其他状态函数的联系','PChem1 第 5—6 课课件，关系总图'],
  'first-law':['thermodynamics-map.png','第一定律的关系总图：由功与热到内能、焓与热容','PChem1 第 5—6 课课件，关系总图'],
  'enthalpy':['thermodynamics-map.png','热力学关系总图中焓及其与内能、热容和反应焓的联系','PChem1 第 5—6 课课件，关系总图'],
  'heat-capacity':['thermodynamics-map.png','热力学关系总图中恒压、恒容热容及其与其他状态函数的关系','PChem1 第 5—6 课课件，关系总图']
};
async function loadTermDetail(){const slug=new URLSearchParams(location.search).get('slug');if(!slug)return;const terms=await getTerms();const t=terms.find(x=>x.slug===slug);if(!t)return;document.title=t.zh+' · 物理化学知识库';const related=t.related.map(s=>terms.find(x=>x.slug===s)).filter(Boolean);const image=TERM_IMAGES[slug];const figure=image?`<figure class="term-figure"><img src="assets/${image[0]}" alt="${image[1]}" loading="eager" decoding="async"><figcaption>${image[1]}<small>图源：${image[2]}</small></figcaption></figure>`:'';document.querySelector('#term-detail').className='term-detail';document.querySelector('#term-detail').innerHTML=`<header><p class="eyebrow">${t.category}</p><h1>${t.zh}</h1><p class="english">${t.en}</p></header>${figure}<section><h2>定义</h2><p class="lead">${t.definition}</p></section><section><h2>详细说明</h2><p>${t.expanded}</p></section><section><h2>主要性质</h2><ul>${t.properties.map(x=>'<li>'+x+'</li>').join('')}</ul></section><section class="note"><h2>辨析与常见误区</h2><p>${t.confusions}</p></section><section><h2>相关词条</h2><div class="related">${related.map(x=>'<a href="term.html?slug='+x.slug+'">'+x.zh+'<small>'+x.en+'</small></a>').join('')}</div></section><footer class="source">笔记来源：${t.source}</footer>`}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
