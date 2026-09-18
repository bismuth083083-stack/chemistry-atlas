(function(){
  if(!document.querySelector('link[data-qa-style]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='qa.css';
    link.dataset.qaStyle='';
    document.head.appendChild(link);
  }
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function init(){
    const main=document.querySelector('main.workspace');
    if(!main||main.querySelector('.qa-panel'))return;
    const key=`analytical-qa-${location.hostname}`;
    let items=[];
    try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
    const panel=document.createElement('section');
    panel.className='qa-panel';
    panel.innerHTML='<h2>课堂问答</h2><p class="qa-hint">把课上疑问先记下来；答案可留空，之后再补入整理后的解释。记录保存在此浏览器中。</p><form class="qa-form"><label for="qa-q">我的问题</label><textarea id="qa-q" required placeholder="例如：为什么高 R² 仍不能单独证明线性良好？"></textarea><label for="qa-a">整理后的回答（可选）</label><textarea id="qa-a" placeholder="可先留空，待复习时补充。"></textarea><button>保存问答</button></form><div class="qa-list"></div>';
    main.appendChild(panel);
    const list=panel.querySelector('.qa-list');
    const render=()=>{
      list.innerHTML=items.length?items.map((item,index)=>`<article class="qa-item"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a||'待补充回答')}</p><div class="qa-meta"><span>${escapeHtml(item.date)}</span><button class="qa-delete" type="button" data-i="${index}">删除</button></div></article>`).join(''):'<p class="qa-hint">还没有记录。</p>';
    };
    panel.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();
      const q=panel.querySelector('#qa-q').value.trim();
      if(!q)return;
      items.unshift({q,a:panel.querySelector('#qa-a').value.trim(),date:new Date().toLocaleString('zh-CN')});
      localStorage.setItem(key,JSON.stringify(items));
      event.target.reset();
      render();
    });
    list.addEventListener('click',event=>{
      const button=event.target.closest('[data-i]');
      if(!button)return;
      items.splice(Number(button.dataset.i),1);
      localStorage.setItem(key,JSON.stringify(items));
      render();
    });
    render();
  }

  async function enhanceTerm(){
    if(!location.pathname.endsWith('term.html'))return;
    const slug=new URLSearchParams(location.search).get('slug');
    if(!slug)return;
    try{
      const terms=await (await fetch('data/terms.json')).json();
      const term=terms.find(item=>item.slug===slug);
      if(!term||(!term.formula&&!term.derivation&&!term.notation))return;
      const detail=document.querySelector('#term-detail');
      if(!detail)return;
      const add=()=>{
        if(detail.querySelector('.term-formula')||!detail.querySelector('header'))return;
        const section=document.createElement('section');
        section.className='term-formula';
        section.innerHTML=`<h2>公式与符号</h2>${term.formula?`<div class="formula">${term.formula}</div>`:''}${term.derivation?`<p><b>推导思路：</b>${term.derivation}</p>`:''}${term.notation?`<p><b>符号说明：</b>${term.notation}</p>`:''}`;
        detail.insertBefore(section,detail.querySelector('footer'));
      };
      add();
      if(!detail.querySelector('header'))new MutationObserver(add).observe(detail,{childList:true});
    }catch{}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  enhanceTerm();
})();
