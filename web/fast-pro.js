/* FAST / PRO workspace; live actions reuse the authenticated publishing API. */
export function createFastMode({el,state,selected,publish,goPro,refresh,isBusy,esc,toast}){
 let filter='review';
 const eligible=x=>x?.status==='review'&&!x.has_photo&&!!x.signal&&!state.settings.emergencyStop;
 const tag=x=>x.status==='sent'?'PUBLISHED':x.status==='failed'?'RECOVERY':eligible(x)?'READY':'REVIEW';
 function render(){
  const queue=el('fastQueue');if(!queue)return;
  const all=state.items||[];
  const ready=all.filter(eligible);
  el('fastReadyNumber').textContent=ready.length;
  el('fastPendingCount').textContent=all.filter(x=>['review','failed'].includes(x.status)).length;
  el('fastImageCount').textContent=all.filter(x=>x.has_photo&&x.status==='review').length;
  el('fastStatus').textContent=state.settings.emergencyStop?'⏸ انتشار متوقف':state.settings.autoPublish?'● دریافت خودکار فعال':'● انتشار دستی';
  el('fastStatus').classList.toggle('halted',!!state.settings.emergencyStop);
  const items=all.filter(x=>filter==='all'||(filter==='photo'?x.has_photo:['review','failed'].includes(x.status)));
  queue.replaceChildren();
  if(!items.length){
   queue.innerHTML='<div class="fx-empty"><strong>صندوق آماده است</strong><span>سیگنال را به ربات فوروارد کنید؛ سپس از اینجا بررسی و منتشر کنید.</span></div>';
   return;
  }
  for(const x of items){
   const canPublish=eligible(x);
   const identities=(x.identifiers||[]).filter(v=>!v.own);
   const status=tag(x),hasSig=!!x.signal;
   const card=document.createElement('article');card.className='fx-card';
   const source=esc(x.source_label||'DrFX Inbox');
   const symbol=esc(x.signal?.symbol||(x.has_photo?'IMAGE SIGNAL':'UNCLASSIFIED'));
   const direction=esc(x.signal?.side||'CHECK');
   const dirClass=x.signal?.side==='BUY'?'buy':x.signal?.side==='SELL'?'sell':'';
   const level=(label,val)=>'<div class="fx-level"><small>'+label+'</small><strong>'+esc(val??'—')+'</strong></div>';
   const draft=esc(String(x.draft_text||x.original_text||'').slice(0,280));
   const idCount=identities.length;
   card.innerHTML=
    '<div class="fx-card-head"><div class="fx-id"><b>#'+Number(x.id)+'</b><span>'+source+'</span></div><span class="fx-status '+(status==='READY'?'ready':'check')+'">'+status+'</span></div>'+
    '<div class="fx-card-title"><strong>'+symbol+'</strong><span class="fx-side '+dirClass+'">'+direction+'</span></div>'+
    '<div class="fx-levels">'+level('ENTRY',x.signal?.entryZone||x.signal?.entry)+level('STOP LOSS',x.signal?.sl)+level('TAKE PROFIT',x.signal?.tps?.filter(Number.isFinite).at(-1))+'</div>'+
    '<div class="fx-draft">'+(draft||'No preview available')+'</div>'+
    '<div class="fx-identity-row"><span>✧ '+(x.has_photo?'تصویر: بازبینی بصری الزامی':'متن: بررسی شناسه‌ها')+'</span><strong>'+(idCount?idCount+' شناسه خارجی در منبع':'شناسه خارجی شناسایی نشد')+'</strong></div>'+
    '<div class="fx-actions">'+
      '<button class="fx-btn publish" type="button" data-fx="publish" data-id="'+Number(x.id)+'" '+(canPublish&&!isBusy()?'':'disabled')+'>'+(canPublish?'↗ انتشار با یک کلیک':'نیازمند بررسی Pro')+'</button>'+
      '<button class="fx-btn" type="button" data-fx="inspect" data-id="'+Number(x.id)+'">✦ بررسی پیشرفته</button>'+
    '</div>';
   queue.append(card);
  }
 }
 function init(){
  const root=el('fastQueue');if(!root)return;
  root.addEventListener('click',async e=>{
   const button=e.target.closest('button[data-fx]');if(!button||isBusy())return;
   const id=Number(button.dataset.id),x=state.items.find(item=>item.id===id);
   if(!x)return;
   if(button.dataset.fx==='inspect'){goPro(id);return;}
   if(button.dataset.fx==='publish'){
    if(!eligible(x)){toast('ابتدا در بخش Pro اطلاعات پیام را بررسی و تأیید کنید.');return;}
    button.disabled=true;button.textContent='در حال انتشار…';
    try{await publish(id);}finally{render();}
   }
  });
  el('fastRefresh').addEventListener('click',refresh);
  document.querySelectorAll('[data-fast-filter]').forEach(button=>button.addEventListener('click',()=>{
   filter=button.dataset.fastFilter;
   document.querySelectorAll('[data-fast-filter]').forEach(x=>x.classList.toggle('active',x===button));
   render();
  }));
 }
 return {init,render};
}
