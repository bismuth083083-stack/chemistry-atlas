const root=document.body;
const theme=document.querySelector('#theme');
const saved=localStorage.getItem('analytical-theme');
if(saved==='light')root.classList.add('light');
theme?.addEventListener('click',()=>{
  root.classList.toggle('light');
  localStorage.setItem('analytical-theme',root.classList.contains('light')?'light':'dark');
});

const globalSearch=document.querySelector('#global-search');
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();
    globalSearch?.focus();
  }
});

async function getTerms(){return (await fetch('data/terms.json')).json()}
async function getNotes(){return (await fetch('data/notes.json')).json()}

globalSearch?.addEventListener('keydown',async event=>{
  if(event.key!=='Enter'||!globalSearch.value.trim())return;
  const q=globalSearch.value.trim().toLowerCase();
  try{
    const notes=await getNotes();
    const best=notes.find(note=>`${note.title} ${note.keywords}`.toLowerCase().includes(q));
    location.href=best?.href||`terms.html?q=${encodeURIComponent(globalSearch.value.trim())}`;
  }catch{
    location.href=`terms.html?q=${encodeURIComponent(globalSearch.value.trim())}`;
  }
});

const termSearch=document.querySelector('#term-search');
const query=new URLSearchParams(location.search).get('q');
if(termSearch&&query)termSearch.value=query;

function termRow(term){
  return `<a class="term-table row" href="term.html?slug=${encodeURIComponent(term.slug)}"><strong>${term.zh}</strong><span>${term.en}</span><span>${term.category}</span><span>${term.related.length}</span></a>`;
}

async function loadTerms(){
  const terms=await getTerms();
  const list=document.querySelector('#term-list');
  const filters=[...document.querySelectorAll('.filter[data-category]')];
  let category='';
  document.querySelector('#term-count').textContent=terms.length;
  const render=()=>{
    const q=(termSearch?.value||'').trim().toLowerCase();
    const categoryPattern=category?new RegExp(category):null;
    const shown=terms.filter(term=>[term.zh,term.en,term.category,...(term.properties||[])].join(' ').toLowerCase().includes(q)&&(!categoryPattern||categoryPattern.test(term.category)));
    list.className=shown.length?'':'table-empty';
    list.innerHTML=shown.length?shown.map(termRow).join(''):'<b>没有匹配词条</b><p>尝试中文名、英文名或分类。</p>';
  };
  termSearch?.addEventListener('input',render);
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.category||'';
    filters.forEach(item=>item.classList.toggle('active',item===button));
    render();
  }));
  render();
}

async function loadTermDetail(){
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug)return;
  const terms=await getTerms();
  const term=terms.find(item=>item.slug===slug);
  if(!term)return;
  document.title=`${term.zh} · 分析化学知识库`;
  const related=term.related.map(itemSlug=>terms.find(item=>item.slug===itemSlug)).filter(Boolean);
  const detail=document.querySelector('#term-detail');
  detail.className='term-detail';
  detail.innerHTML=`<header><p class="eyebrow">${term.category}</p><h1>${term.zh}</h1><p class="english">${term.en}</p></header><section><h2>定义</h2><p class="lead">${term.definition}</p></section><section><h2>详细说明</h2><p>${term.expanded}</p></section><section><h2>主要性质</h2><ul>${term.properties.map(item=>`<li>${item}</li>`).join('')}</ul></section><section class="note"><h2>辨析与常见误区</h2><p>${term.confusions}</p></section><section><h2>相关词条</h2><div class="related">${related.map(item=>`<a href="term.html?slug=${item.slug}">${item.zh}<small>${item.en}</small></a>`).join('')}</div></section><footer class="source">笔记来源：${term.source}</footer>`;
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
