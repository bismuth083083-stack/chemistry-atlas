const typography=document.createElement('link');
typography.rel='stylesheet';
typography.href='typography.css';
document.head.appendChild(typography);
if(!document.querySelector('a[href="lesson-04-matrices.html"]')){const matrixNav=document.createElement('a');matrixNav.href='lesson-04-matrices.html';matrixNav.innerHTML='<span>04+</span>操作矩阵专题';document.querySelector('.sidebar nav')?.appendChild(matrixNav)}
const root=document.body;
const theme=document.querySelector('#theme');
const saved=localStorage.getItem('inorganic-theme')||localStorage.getItem('ochem-theme');
if(saved==='light')root.classList.add('light');
theme?.addEventListener('click',()=>{root.classList.toggle('light');localStorage.setItem('inorganic-theme',root.classList.contains('light')?'light':'dark')});
const globalSearch=document.querySelector('#global-search');
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();globalSearch?.focus()}});
globalSearch?.addEventListener('keydown',e=>{if(e.key==='Enter'&&globalSearch.value.trim())location.href='terms.html?q='+encodeURIComponent(globalSearch.value.trim())});
const termSearch=document.querySelector('#term-search');
const query=new URLSearchParams(location.search).get('q');
if(termSearch&&query)termSearch.value=query;
async function getTerms(){const r=await fetch('data/terms.json');return r.json()}
function termRow(t){return `<a class="term-table row" href="term.html?slug=${encodeURIComponent(t.slug)}"><strong>${t.zh}</strong><span>${t.en}</span><span>${t.category}</span><span>${t.related.length}</span></a>`}
async function loadTerms(){
  const terms=await getTerms();
  const notes=await fetch('data/notes.json').then(r=>r.ok?r.json():[]).catch(()=>[]);
  const list=document.querySelector('#term-list');
  document.querySelector('#term-count').textContent=terms.length;
  const noteResults=document.createElement('section');
  noteResults.setAttribute('aria-label','笔记检索结果');
  document.querySelector('.table-shell').after(noteResults);
  const render=()=>{
    const q=(termSearch?.value||'').trim().toLowerCase();
    const shown=terms.filter(t=>[t.zh,t.en,t.category,t.definition,t.expanded,...(t.aliases||[]),...(t.properties||[])].join(' ').toLowerCase().includes(q));
    list.className=shown.length?'':'table-empty';
    list.innerHTML=shown.length?shown.map(termRow).join(''):'<b>没有匹配词条</b><p>可继续查看下方的笔记搜索结果。</p>';
    noteResults.replaceChildren();
    if(!q)return;
    const matches=notes.filter(n=>(n.title+' '+n.text).toLowerCase().includes(q));
    const heading=document.createElement('h2');heading.textContent='笔记搜索 · '+matches.length+' 个结果';noteResults.append(heading);
    for(const n of matches){
      const a=document.createElement('a');a.href=n.href;a.className='chapter-card';
      const content=document.createElement('div');
      const title=document.createElement('h3');title.textContent=n.title;
      const excerpt=document.createElement('p');
      const hit=n.text.toLowerCase().indexOf(q);const start=Math.max(0,hit-36);
      excerpt.textContent=(start?'…':'')+n.text.slice(start,start+160)+'…';
      content.append(title,excerpt);a.append(content);a.style.gridTemplateColumns='1fr';noteResults.append(a);
    }
  };
  termSearch?.addEventListener('input',render);render();
}
async function loadTermDetail(){const slug=new URLSearchParams(location.search).get('slug');if(!slug)return;const terms=await getTerms();const t=terms.find(x=>x.slug===slug);if(!t)return;document.title=t.zh+' · 无机化学知识库';const related=t.related.map(s=>terms.find(x=>x.slug===s)).filter(Boolean);document.querySelector('#term-detail').className='term-detail';document.querySelector('#term-detail').innerHTML=`<header><p class="eyebrow">${t.category}</p><h1>${t.zh}</h1><p class="english">${t.en}</p></header><section><h2>定义</h2><p class="lead">${t.definition}</p></section><section><h2>详细说明</h2><p>${t.expanded}</p></section><section><h2>主要性质</h2><ul>${t.properties.map(x=>'<li>'+x+'</li>').join('')}</ul></section><section class="note"><h2>辨析与常见误区</h2><p>${t.confusions}</p></section><section><h2>相关词条</h2><div class="related">${related.map(x=>'<a href="term.html?slug='+x.slug+'">'+x.zh+'<small>'+x.en+'</small></a>').join('')}</div></section><footer class="source">笔记来源：${t.source}</footer>`}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
