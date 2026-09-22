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
async function loadTermDetail(){const slug=new URLSearchParams(location.search).get('slug');if(!slug)return;const terms=await getTerms();const t=terms.find(x=>x.slug===slug);if(!t)return;document.title=t.zh+' · 物理化学知识库';const related=t.related.map(s=>terms.find(x=>x.slug===s)).filter(Boolean);document.querySelector('#term-detail').className='term-detail';document.querySelector('#term-detail').innerHTML=`<header><p class="eyebrow">${t.category}</p><h1>${t.zh}</h1><p class="english">${t.en}</p></header><section><h2>定义</h2><p class="lead">${t.definition}</p></section><section><h2>详细说明</h2><p>${t.expanded}</p></section><section><h2>主要性质</h2><ul>${t.properties.map(x=>'<li>'+x+'</li>').join('')}</ul></section><section class="note"><h2>辨析与常见误区</h2><p>${t.confusions}</p></section><section><h2>相关词条</h2><div class="related">${related.map(x=>'<a href="term.html?slug='+x.slug+'">'+x.zh+'<small>'+x.en+'</small></a>').join('')}</div></section><footer class="source">笔记来源：${t.source}</footer>`}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
