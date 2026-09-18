const loader=document.querySelector('#loader');
const clock=document.querySelector('#clock');

addEventListener('load',()=>{window.setTimeout(()=>loader?.classList.add('hide'),650)});

function updateClock(){
  if(!clock)return;
  clock.textContent=new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date());
}
updateClock();
window.setInterval(updateClock,30000);

if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.querySelectorAll('.subject').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      card.style.transform=`translateY(-5px) perspective(900px) rotateX(${-y*2.4}deg) rotateY(${x*3}deg)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
    card.addEventListener('blur',()=>{card.style.transform=''});
  });
}
