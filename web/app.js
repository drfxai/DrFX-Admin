import {createFastMode} from './fast-pro.js';
const telegram=window.Telegram?.WebApp;
const demo=new URLSearchParams(location.search).get('demo')==='1'||location.protocol==='file:'||window.__DRFX_DEMO__===true;
if(demo)document.body.classList.add('demo');
if(telegram){try{telegram.ready();telegram.expand();telegram.setHeaderColor('#070c17');telegram.setBackgroundColor('#070c17');}catch{}}
const el=id=>document.getElementById(id);
const samples=[
 {id:104,content_type:'photo',has_photo:true,source_label:'Sample Gold Signals',original_text:'Gold sell now 3908 | SL 3915 | TP1 3903 | TP2 3895 | TP3 3890',draft_text:'✦ DR FX AI | PREMIUM SIGNALS\n\n📈 XAUUSD  •  🔴 SELL\n━━━━━━━━━━━━━━━━━━\n📍 Entry   3908\n🛑 SL        3915\n🎯 TP1      3903\n🎯 TP2      3895\n🎯 TP3      3890\n\n⚡ Risk / Reward   1:2.57\n\n🌐 https://drfx.company\n\nSource: Sample Gold Signals',ocr_text:'Gold sell now 3908\nSL 3915\nTP1 3903\nTP2 3895\nTP3 3890',status:'review',created_at:1730502000,signal:{symbol:'XAUUSD',side:'SELL',entry:3908,sl:3915,tps:[3903,3895,3890],rr:2.57}},
 {id:103,content_type:'text',has_photo:false,source_label:'Sample Forex Alerts',original_text:'EURUSD BUY 1.0810 SL 1.0780 TP1 1.0870',draft_text:'✦ DR FX AI | PREMIUM SIGNALS\n\n📈 EURUSD  •  🟢 BUY\n━━━━━━━━━━━━━━━━━━\n📍 Entry   1.0810\n🛑 SL        1.0780\n🎯 TP1      1.0870\n\n🌐 https://drfx.company\nSource: Sample Forex Alerts',ocr_text:'',status:'review',created_at:1730501000,signal:{symbol:'EURUSD',side:'BUY',entry:1.0810,sl:1.0780,tps:[1.0870],rr:2}},
 {id:102,content_type:'photo',has_photo:true,source_label:'Sample Channel',original_text:'XAUUSD BUY 3880 SL 3874 TP1 3888',draft_text:'✦ DR FX AI | PREMIUM SIGNALS\n\n📈 XAUUSD  •  🟢 BUY\n📍 Entry 3880\n🛑 SL 3874\n🎯 TP1 3888\n🌐 https://drfx.company\nSource: Sample Channel',ocr_text:'',status:'sent',created_at:1730500000,signal:{symbol:'XAUUSD',side:'BUY',entry:3880,sl:3874,tps:[3888],rr:1.33}},
 {id:101,content_type:'text',has_photo:false,source_label:'Demo Feed',original_text:'Gold sell 3917 SL 3924 TP1 3909',draft_text:'✦ DR FX AI | PREMIUM SIGNALS\n\n📈 XAUUSD  •  🔴 SELL\n📍 Entry 3917\n🛑 SL 3924\n🎯 TP1 3909\n🌐 https://drfx.company\nSource: Demo Feed',ocr_text:'',status:'sent',created_at:1730499000,signal:{symbol:'XAUUSD',side:'SELL',entry:3917,sl:3924,tps:[3909],rr:1.14}}
];
const state={items:[],selected:null,filter:'all',page:'home',isEditing:false,settings:{brandName:'DR FX AI',website:'https://drfx.company',handle:'',watermark:true,photoMode:'watermark',autoPublish:true,authorized:false,channelConfigured:true,scanDepth:'balanced',identityGuard:true}};
let busy=false,toastTimer,inboxMode='fast';
const fastMode=createFastMode({
 el,state,selected,esc,toast,isBusy:()=>busy,refresh:()=>load(),
 goPro:(id)=>{state.selected=id;setEdit(false);page('pro');render();},
 publish:async(id)=>{state.selected=id;setEdit(false);await mutation('publish');}
});
function toast(text){const e=el('toast');e.textContent=text;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3300);}
function esc(text){return String(text??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function initials(item){if(item.content_type==='photo')return '▧';return item.signal?.symbol==='XAUUSD'?'🥇':item.signal?.side==='BUY'?'↗':'↘';}
function statusFa(status){return ({review:'در انتظار',sent:'منتشر شده',sending:'در حال ارسال',failed:'خطای ارسال',rejected:'رد شده'})[status]||status;}
function itemTitle(item){return item.signal?item.signal.symbol+'  •  '+item.signal.side:item.has_photo?'سیگنال تصویری':'پیام متنی';}
function selected(){return state.items.find(x=>x.id===state.selected)||null;}
function setBusy(v){busy=v;for(const id of ['ocrBtn','regenBtn','saveDraft','publishBtn','rejectBtn','confirmPublish'])el(id).disabled=v||(!selected()&&id!=='confirmPublish');renderHome();}
function updateTotals(){const total=state.items.length,sent=state.items.filter(x=>x.status==='sent').length,review=state.items.filter(x=>x.status==='review'||x.status==='failed').length,photos=state.items.filter(x=>x.has_photo).length;el('numTotal').textContent=total;el('numPending').textContent=review;el('numSent').textContent=sent;el('numPhotos').textContent=photos;el('sidePending').textContent=review;el('inboxCount').textContent=review+' نیازمند بررسی';if(el('mobilePending')){el('mobilePending').textContent=review;el('mobilePending').hidden=review===0;}}
function renderList(){el('deleteAllBtn').disabled=busy||!state.items.length;const items=state.items.filter(i=>state.filter==='all'||(state.filter==='photo'?i.has_photo:state.filter==='review'?['review','failed'].includes(i.status):i.status===state.filter));const root=el('itemList');root.replaceChildren();if(!items.length){root.innerHTML='<div class="noitems"><div class="empty-icon">◌</div>پیامی در این بخش وجود ندارد.<br><small>سیگنال را برای ربات فوروارد کنید.</small></div>';return;}
 for(const x of items){const btn=document.createElement('button');btn.type='button';btn.className='item '+(x.id===state.selected?'selected':'');btn.innerHTML=`<span class="symbol ${x.has_photo?'photo':x.signal?.side==='BUY'?'buy':''}">${esc(initials(x))}</span><span class="item-body"><span class="item-top"><span dir="ltr">${esc(itemTitle(x))}</span><span class="status ${esc(x.status)}">${esc(statusFa(x.status)+(x.status==='sent'&&x.destination_message_id?' #'+x.destination_message_id:''))}</span></span><span class="item-bottom"><span>${esc(x.source_label||'بدون منبع')}</span><span>${x.has_photo?'◈ تصویر':'⌁ متن'}</span></span></span>`;btn.addEventListener('click',()=>{state.selected=x.id;setEdit(false);render();if(innerWidth<700)el('previewBox').scrollIntoView({behavior:'smooth',block:'center'});});root.append(btn);}}
function setEdit(value){state.isEditing=value;el('previewBox').classList.toggle('editmode',value);el('tabEdit').classList.toggle('active',value);el('tabPreview').classList.toggle('active',!value);el('saveDraft').style.display=value?'inline-flex':'none';}
async function loadPhoto(x){
 const img=el('photoPreview');img.removeAttribute('src');
 if(demo){img.src='./assets/demo-chart.jpg';return;}
 try{
  let cfg=imageData.get(x.id);
  if(!cfg){cfg=(await api('/api/items/'+x.id+'/image')).image_edit;imageData.set(x.id,cfg);}
  if(img.dataset.selected!==String(x.id))return;
  const file=editedPhotoCache.get(x.id)||await drawCleanedJPEG(x,cfg);
  editedPhotoCache.set(x.id,file);displayEditedPhoto(x,file);
 }catch(e){
  try{
   const res=await fetch('/api/items/'+x.id+'/source-image',{headers:{'X-Telegram-Init-Data':telegram?.initData||''}});
   if(!res.ok)throw Error();
   const url=URL.createObjectURL(await res.blob());
   if(img.dataset.selected===String(x.id)){img.src=url;img.onload=()=>URL.revokeObjectURL(url);}else URL.revokeObjectURL(url);
   toast('این تصویر خام است؛ پاکسازی را بررسی کنید.');
  }catch{toast('دریافت تصویر ناموفق بود');}
 }
}

const imageData=new Map(),imagePending=new Set();
async function ensureImageData(x){if(!x?.has_photo||imageData.has(x.id)||imagePending.has(x.id)||demo)return;imagePending.add(x.id);try{const r=await api('/api/items/'+x.id+'/image');imageData.set(x.id,r.image_edit);showImageData();}catch(e){toast(e.message);}finally{imagePending.delete(x.id);}}

const visualState={itemId:null,url:null,drawing:null};
const visualClamp=n=>Math.max(0,Math.min(1,n));
function visualPoint(e){const r=el('visualOverlay').getBoundingClientRect();return {x:visualClamp((e.clientX-r.left)/Math.max(1,r.width)),y:visualClamp((e.clientY-r.top)/Math.max(1,r.height))};}
function visualBox(x,y,w,h,cls){const d=document.createElement('div');d.className=cls;d.style.left=x*100+'%';d.style.top=y*100+'%';d.style.width=w*100+'%';d.style.height=h*100+'%';return d;}
async function loadVisualSource(item){
 if(visualState.itemId===item.id)return;
 visualState.itemId=item.id;visualState.drawing=null;
 const img=el('visualSource'),empty=el('visualStageEmpty');
 if(visualState.url){URL.revokeObjectURL(visualState.url);visualState.url=null;}
 img.removeAttribute('src');empty.hidden=false;empty.textContent='در حال دریافت تصویر اصلی…';
 if(demo){img.src='./assets/demo-chart.jpg';img.onload=()=>{if(visualState.itemId===item.id)empty.hidden=true;};return;}
 try{
  const res=await fetch('/api/items/'+item.id+'/source-image',{headers:{'X-Telegram-Init-Data':telegram?.initData||''}});
  if(!res.ok)throw Error('Cannot load source image');
  const blob=await res.blob(),url=URL.createObjectURL(blob);
  if(visualState.itemId!==item.id){URL.revokeObjectURL(url);return;}
  visualState.url=url;
  img.onload=()=>{if(visualState.itemId===item.id){empty.hidden=true;renderVisualEditor();}};
  img.onerror=()=>{empty.hidden=false;empty.textContent='تصویر اصلی قابل نمایش نیست.';};
  img.src=url;
 }catch(e){if(visualState.itemId===item.id)empty.textContent='دریافت تصویر اصلی ناموفق بود.';}
}
function renderVisualEditor(){
 const x=selected(),v=x&&imageData.get(x.id),over=el('visualOverlay');
 if(!x?.has_photo){over.replaceChildren();visualState.itemId=null;return;}
 if(visualState.itemId!==x.id)loadVisualSource(x);
 over.replaceChildren();
 const locked=busy||!v||!['review','failed'].includes(x.status)||state.settings.photoMode==='card';
 el('visualWorkspace').classList.toggle('is-card-mode',state.settings.photoMode==='card');
 el('visualModeHint').textContent=state.settings.photoMode==='card'?'حالت کارت فعال است: خروجی کارت از اطلاعات سیگنال ساخته می‌شود؛ برای حذف نوشته از عکس، حالت واترمارک را انتخاب کنید.':'روی تصویر اصلی بکشید؛ سپس خروجی JPEG را پیش‌نمایش و تأیید کنید.';
 over.classList.toggle('is-locked',locked);
 const top=Math.max(0,Math.min(.25,+v?.trim_top||0)),bottom=Math.max(0,Math.min(.25,+v?.trim_bottom||0));
 if(top)over.append(visualBox(0,0,1,top,'visual-trim'));
 if(bottom)over.append(visualBox(0,1-bottom,1,bottom,'visual-trim is-bottom'));
 for(const m of v?.redactions||[])over.append(visualBox(m.x,m.y,m.w,m.h,'visual-mask'));
 if(visualState.drawing&&visualState.drawing.id===x.id){
  const a=visualState.drawing.start,b=visualState.drawing.end;
  over.append(visualBox(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y),'visual-mask is-drawing'));
 }
 el('visualMaskBadge').textContent=(v?.redactions?.length||0)+' ناحیه پوشش';
 const maskList=el('visualMasksList');maskList.replaceChildren();
 for(const [index] of (v?.redactions||[]).entries()){const chip=document.createElement('button');chip.type='button';chip.className='visual-mask-chip';chip.disabled=locked;chip.textContent='× حذف ناحیه '+(index+1);chip.addEventListener('click',()=>{const item=selected(),cfg=imageData.get(item?.id);if(!item||!cfg||!['review','failed'].includes(item.status))return;cfg.redactions=(cfg.redactions||[]).filter((_,i)=>i!==index);visualInvalidate(item,cfg);toast('ناحیه انتخاب‌شده حذف شد.');});maskList.append(chip);}
}
function visualInvalidate(item,config){config.scan_status='needs_review';config.scan_note='محدوده‌های حذف تغییر کرده‌اند؛ تصویر نهایی را دوباره تأیید کنید.';imageData.set(item.id,config);editedPhotoCache.delete(item.id);showImageData();}
function cropInput(side){const x=selected(),v=imageData.get(x?.id);if(!v||!['review','failed'].includes(x.status))return;v[side]=Number(el(side==='trim_top'?'cropTop':'cropBottom').value)/100;visualInvalidate(x,v);}
function visualPointerStart(e){
 const x=selected(),v=imageData.get(x?.id);
 if(!x?.has_photo||!v||busy||!['review','failed'].includes(x.status)||e.button>0)return;
 const point=visualPoint(e);visualState.drawing={id:x.id,pointer:e.pointerId,start:point,end:point};
 try{el('visualOverlay').setPointerCapture(e.pointerId);}catch{}
 renderVisualEditor();e.preventDefault();
}
function visualPointerMove(e){const d=visualState.drawing;if(!d||d.pointer!==e.pointerId)return;d.end=visualPoint(e);renderVisualEditor();e.preventDefault();}
function visualPointerEnd(e){
 const d=visualState.drawing;if(!d||d.pointer!==e.pointerId)return;
 d.end=visualPoint(e);visualState.drawing=null;
 const x=selected(),v=imageData.get(x?.id);
 if(!x||x.id!==d.id||!v){renderVisualEditor();return;}
 const m={x:Math.min(d.start.x,d.end.x),y:Math.min(d.start.y,d.end.y),w:Math.abs(d.start.x-d.end.x),h:Math.abs(d.start.y-d.end.y),kind:'manual'};
 if(m.w<.009||m.h<.009){renderVisualEditor();return;}
 if(m.w*m.h>=.2){toast('محدوده بزرگ است؛ برای محافظت از چارت ناحیه کوچک‌تری انتخاب کنید.');renderVisualEditor();return;}
 if((v.redactions||[]).length>=10){toast('حداکثر ۱۰ ناحیه قابل انتخاب است.');renderVisualEditor();return;}
 v.redactions=[...(v.redactions||[]),m];visualInvalidate(x,v);
 toast('محدوده انتخاب شد؛ پیش‌نمایش جدید و سپس تأیید را بزنید.');e.preventDefault();
}

function showImageData(){const x=selected(),panel=el('cleanBox');panel.style.display=x?.has_photo?'block':'none';if(!x?.has_photo)return;const v=imageData.get(x.id);el('cleanStatus').textContent=v?.scan_status==='approved'?'✓ آماده انتشار':v?.scan_status==='needs_review'?'نیازمند تأیید':'در انتظار اسکن';el('cleanNote').textContent=v?.scan_note||'برای عکس، نواحی پاکسازی را بررسی کنید.';el('cropTop').value=Math.round((v?.trim_top??.06)*100);el('cropBottom').value=Math.round((v?.trim_bottom??.07)*100);el('topLabel').textContent=el('cropTop').value+'٪';el('bottomLabel').textContent=el('cropBottom').value+'٪';el('maskNumber').textContent=v?.redactions?.length||0;for(const name of ['scanImageBtn','addMaskBtn','undoMaskBtn','saveImageBtn','approveImageBtn'])el(name).disabled=busy||!v||x.status==='sent';el('publishBtn').disabled=busy||x.status!=='review'||v?.scan_status!=='approved';renderVisualEditor();}
function imagePayload(){const x=selected(),d=imageData.get(x?.id);return {...d,trim_top:Number(el('cropTop').value)/100,trim_bottom:Number(el('cropBottom').value)/100,redactions:d?.redactions||[]};}
function resetPhotoPreview(){const x=selected();if(!x)return;el('photoPreview').dataset.loaded='';loadPhoto(x);}


async function renderSignalCardJPEG(item){
 const sig=item?.signal;
 if(!sig)throw Error('Signal card requires verified trading parameters');
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=820;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Card canvas unavailable');
 const grad=ctx.createLinearGradient(0,0,1200,820);grad.addColorStop(0,'#162942');grad.addColorStop(.58,'#0a172b');grad.addColorStop(1,'#0c2235');ctx.fillStyle=grad;ctx.fillRect(0,0,1200,820);
 ctx.strokeStyle='rgba(107,150,194,.09)';ctx.lineWidth=1;
 for(let x=30;x<1200;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,820);ctx.stroke();}
 for(let y=30;y<820;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1200,y);ctx.stroke();}
 ctx.strokeStyle='#b9945b';ctx.lineWidth=3;ctx.strokeRect(28,28,1144,764);
 ctx.textAlign='left';ctx.fillStyle='#f5d28e';ctx.font='900 52px Inter,Arial';ctx.fillText(String(state.settings.brandName||'DR FX AI').slice(0,27),79,118);
 ctx.fillStyle='#a6bdd1';ctx.font='600 23px Inter,Arial';ctx.fillText('PREMIUM TRADING SIGNAL',82,156);
 ctx.strokeStyle='rgba(230,185,102,.28)';ctx.beginPath();ctx.moveTo(80,184);ctx.lineTo(1120,184);ctx.stroke();
 const sell=sig.side==='SELL';ctx.fillStyle=sell?'#ff8fa8':'#53e4bc';ctx.font='900 76px Inter,Arial';ctx.fillText(String(sig.symbol||'SYMBOL')+' / '+String(sig.side||''),77,284);
 const fields=[['ENTRY',sig.entryZone||sig.entry],['STOP LOSS',sig.sl],...(sig.tps||[]).filter(Number.isFinite).slice(0,3).map((v,i)=>['TARGET '+(i+1),v])];
 ctx.font='700 24px Inter,Arial';ctx.textBaseline='middle';
 for(let i=0;i<fields.length;i++){
  const col=i%2,row=Math.floor(i/2),x=80+col*535,y=332+row*110;
  ctx.fillStyle='#132b44';ctx.fillRect(x,y,505,91);
  ctx.strokeStyle='rgba(99,155,203,.24)';ctx.strokeRect(x,y,505,91);
  ctx.fillStyle='#93acc5';ctx.font='700 19px Inter,Arial';ctx.fillText(fields[i][0],x+25,y+28);
  ctx.fillStyle=i===1?'#ff9fab':'#e8effc';ctx.font='900 31px Inter,Arial';ctx.fillText(String(fields[i][1]),x+25,y+64);
 }
 ctx.textBaseline='alphabetic';ctx.font='700 23px Inter,Arial';ctx.fillStyle='#edc98d';ctx.fillText(String(state.settings.website||'https://drfx.company').replace(/^https?:\/\//,'').slice(0,55),80,754);
 ctx.textAlign='right';ctx.font='600 20px Inter,Arial';ctx.fillStyle='#a2b8cc';ctx.fillText(String(state.settings.handle||'').slice(0,35),1116,754);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Card JPEG export failed')),'image/jpeg',.87));
}

async function drawCleanedJPEG(item,cfg){
 if(state.settings.photoMode==='card'&&item?.signal)return renderSignalCardJPEG(item);
 const headers={'X-Telegram-Init-Data':telegram?.initData||''};
 const res=await fetch('/api/items/'+item.id+'/source-image',{headers});
 if(!res.ok)throw Error('Cannot load source image');
 const original=await res.blob(),url=URL.createObjectURL(original),img=new Image();
 try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});}
 finally{URL.revokeObjectURL(url);}
 const fullW=img.naturalWidth,fullH=img.naturalHeight;
 const t=Number(cfg.trim_top)||0,b=Number(cfg.trim_bottom)||0,l=Number(cfg.trim_left)||0,r=Number(cfg.trim_right)||0;
 const sx=Math.round(fullW*l),sy=Math.round(fullH*t),sw=Math.round(fullW*(1-l-r)),sh=Math.round(fullH*(1-t-b));
 if(sw<100||sh<100)throw Error('Crop too large');
 const k=Math.min(1,1400/sw,1400/sh),canvas=document.createElement('canvas');
 canvas.width=Math.max(100,Math.round(sw*k));canvas.height=Math.max(100,Math.round(sh*k));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)throw Error('Canvas unavailable');
 ctx.drawImage(img,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
 for(const m of (cfg.redactions||[])){
  const x=Math.max(0,Math.round((m.x-l)*fullW*k)),y=Math.max(0,Math.round((m.y-t)*fullH*k));
  const x2=Math.min(canvas.width,Math.round((m.x+m.w-l)*fullW*k)),y2=Math.min(canvas.height,Math.round((m.y+m.h-t)*fullH*k));
  if(x>=canvas.width||y>=canvas.height||x2-x<1||y2-y<1)continue;
  let rgba=[225,225,225];
  try{const sample=ctx.getImageData(Math.max(0,x-4),Math.max(0,y-4),1,1).data;rgba=[sample[0],sample[1],sample[2]];}catch{}
  ctx.fillStyle='rgb('+rgba.join(',')+')';ctx.fillRect(x,y,x2-x,y2-y);
 }
 if(state.settings.watermark){
  const fontSize=Math.max(13,Math.round(canvas.width*.023));
  ctx.textBaseline='top';ctx.font='800 '+fontSize+'px Arial,sans-serif';
  ctx.shadowColor='rgba(0,0,0,.85)';ctx.shadowBlur=3;ctx.fillStyle='#f0cb87';
  ctx.fillText((state.settings.brandName||'DR FX AI').slice(0,30),Math.round(canvas.width*.02),Math.round(canvas.height*.02));
  ctx.shadowBlur=0;
 }
 const convert=q=>new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',q));
 let out=await convert(.85);if(out?.size>1450000)out=await convert(.67);
 if(!out||out.size>1500000)throw Error('Cleaned JPEG exceeds free storage limit');
 return out;
}

const editedPhotoCache=new Map();
function displayEditedPhoto(item,blob){const img=el('photoPreview'),url=URL.createObjectURL(blob);if(img.dataset.selected!==String(item.id)){URL.revokeObjectURL(url);return;}img.src=url;img.onload=()=>URL.revokeObjectURL(url);img.dataset.loaded=String(item.id);}
async function storeCleanedJPEG(item,cfg){const blob=await drawCleanedJPEG(item,cfg);editedPhotoCache.set(item.id,blob);displayEditedPhoto(item,blob);return blob;}
async function imageAction(action){
 const x=selected();if(!x?.has_photo||busy||demo)return;setBusy(true);
 try{
  let cfg;
  if(action==='scan'){const r=await api('/api/items/'+x.id+'/scan',{method:'POST'});cfg=r.image_edit;imageData.set(x.id,cfg);}
  else{const r=await api('/api/items/'+x.id+'/image',{method:'POST',body:{...imagePayload(),approve:false}});cfg=r.image_edit;imageData.set(x.id,cfg);}
  if(!cfg)throw Error('Image configuration unavailable');
  await storeCleanedJPEG(x,cfg);
  if(action==='approve'){const r=await api('/api/items/'+x.id+'/image',{method:'POST',body:{...cfg,approve:true}});imageData.set(x.id,r.image_edit);}
  toast(action==='approve'?'✓ تصویر برای انتشار آماده است.':'✓ تصویر ویرایش شد؛ تأیید کنید.');
 }catch(e){toast('خطای تصویر: '+e.message);}finally{setBusy(false);renderEditor();}
}

function addMask(){const x=selected(),d=imageData.get(x?.id);if(!d)return;const m={x:Number(el('maskX').value)/100,y:Number(el('maskY').value)/100,w:Number(el('maskW').value)/100,h:Number(el('maskH').value)/100,kind:'manual'};if(![m.x,m.y,m.w,m.h].every(Number.isFinite)||m.w<=0||m.h<=0||m.x+m.w>1||m.y+m.h>1){toast('مختصات ماسک نامعتبر است');return;}d.redactions=[...(d.redactions||[]),m];visualInvalidate(x,d);toast('ماسک افزوده شد؛ پیش‌نمایش جدید را بزنید.');}


function renderRecoveryPanel(){
 const x=selected(),box=el('recoveryPanel');
 const visible=!!x&&(x.status==='failed'||x.status==='sending');
 box.hidden=!visible;
 if(!visible)return;
 const mode=x.recovery||(x.status==='sending'?'sending':'uncertain');
 box.dataset.kind=mode;
 const title=el('recoveryTitle'),tag=el('recoveryTag'),detail=el('recoveryDetail'),action=el('recoveryPrepare');
 const attempts=Number(x.publish_attempts||0);
 tag.textContent='SMART RECOVERY • ATTEMPT '+attempts;
 action.hidden=mode==='sending';
 action.disabled=busy;
 if(mode==='sending'){
  title.textContent='در حال بررسی نتیجه انتشار';
  detail.textContent='درخواست انتشار هنوز در جریان است یا پاسخ آن ثبت نشده. هیچ تلاش مجددی تا تعیین نتیجه انجام نمی‌شود.';
 }else if(mode==='rejected'){
  title.textContent='انتشار توسط تلگرام رد شد';
  detail.textContent='تلگرام درخواست را نپذیرفته است. ابتدا علت را اصلاح کنید و مطمئن شوید پست در کانال نیست. '+String(x.error||'').replace(/^\[REJECTED\]\s*/,'').slice(0,130);
  action.textContent='آماده‌سازی انتشار مجدد';
 }else if(mode==='sent_unrecorded'){
  title.textContent='انتشار انجام شد، ثبت محلی ناقص است';
  detail.textContent='تلگرام شناسه پیام موفق داده است؛ فقط وضعیت دیتابیس اصلاح می‌شود، هیچ پیام جدیدی ارسال نخواهد شد.';
  action.textContent='✓ ثبت انتشار موفق';
 }else{
  title.textContent='نتیجه انتشار نامطمئن است';
  detail.textContent='ممکن است پست قبلاً ارسال شده باشد. حتماً کانال DR FX AI را دستی بررسی کنید؛ فقط اگر مطمئن شدید منتشر نشده، آماده‌سازی مجدد را تأیید کنید.';
  action.textContent='بررسی کردم؛ آماده‌سازی مجدد';
 }
 el('recoveryRefresh').disabled=busy;
}
async function recoverCurrentPost(){
 const x=selected();if(!x||x.status!=='failed'||busy||demo)return;
 const mode=x.recovery||'uncertain';
 if(mode==='uncertain'||mode==='rejected'){
  const checked=await askDelete('آیا کانال DR FX AI را بررسی کرده‌اید و مطمئن هستید پیام شماره '+x.id+' منتشر نشده است؟ اگر پیام قبلاً ارسال شده باشد، تلاش مجدد می‌تواند پست تکراری ایجاد کند.');
  if(!checked)return;
 }
 setBusy(true);
 try{
  const action=mode==='sent_unrecorded'?'reconcile':'prepare_retry';
  const response=await api('/api/items/'+x.id+'/recovery',{method:'POST',body:{action,confirmed_not_published:mode!=='sent_unrecorded'}});
  if(response.item){const i=state.items.findIndex(y=>y.id===x.id);if(i>=0)state.items[i]=response.item;}
  toast(action==='reconcile'?'✅ وضعیت انتشار موفق ثبت شد.':'✅ پیام به وضعیت بررسی برگشت؛ هنوز ارسال مجدد نشده است.');
  await load();page('inbox');
 }catch(e){toast('بازیابی انجام نشد: '+e.message);}
 finally{setBusy(false);renderEditor();}
}

function renderEditor(){renderRecoveryPanel();const x=selected();const valid=x&&(x.status==='review'||x.status==='failed');const hasPhoto=Boolean(x?.has_photo);el('smartCategory').textContent=x?.category?x.category.kind+' / '+x.category.market:'—';el('templatePicker').disabled=busy||!x||!['review','failed'].includes(x.status);el('applyTemplateBtn').disabled=busy||!x||!['review','failed'].includes(x.status);for(const b of document.querySelectorAll('[data-ai-mode]'))b.disabled=busy||!x||!['review','failed'].includes(x.status);el('editPublishedBtn').style.display=x?.status==='sent'?'inline-flex':'none';el('editPublishedBtn').disabled=busy||x?.status!=='sent'||!state.isEditing;const success=el('publicationResult');success.hidden=x?.status!=='sent';if(x?.status==='sent')success.textContent='✅ انتشار موفق در کانال DR FX AI'+(x.destination_message_id?' | شماره پیام: '+x.destination_message_id:'');el('selectionMeta').textContent=x?`#${x.id}   •   ${x.source_label||'Unknown'}`:'یک پیام را انتخاب کنید';el('editorState').textContent=x?statusFa(x.status):'در انتظار انتخاب';el('editorState').className='status '+(x?.status||'review');if(!state.isEditing)el('draftView').textContent=x?.draft_text||'برای مشاهده پیش‌نویس، یک پیام را از صندوق انتخاب کنید.';el('draftEdit').value=x?.draft_text||'';el('draftEdit').maxLength=hasPhoto?(x?.status==='sent'?1024:800):(x?.status==='sent'?4096:3900);el('previewImage').classList.toggle('visible',hasPhoto);const cardMode=state.settings.photoMode==='card' && hasPhoto && !!x?.signal;el('previewImage').classList.toggle('card-mode',cardMode);if(cardMode){el('cardBrand').textContent=state.settings.brandName+' / PREMIUM SIGNALS';el('cardTitle').textContent=x.signal.symbol+' / '+x.signal.side;el('cardTitle').classList.toggle('sell',x.signal.side==='SELL');el('cardFields').textContent='ENTRY       '+(x.signal.entryZone||x.signal.entry)+'\nSTOP LOSS  '+x.signal.sl+'\n'+(x.signal.tps||[]).map((tp,i)=>Number.isFinite(tp)?'TARGET '+(i+1)+'     '+tp:'').filter(Boolean).join('\n');el('cardSite').textContent=state.settings.website.replace(/^https?:\/\//,'');}el('watermarkLabel').style.display=state.settings.watermark?'':'none';el('watermarkLabel').textContent=`${state.settings.brandName} · ${state.settings.website.replace(/^https?:\/\//,'')}`;
 if(hasPhoto){ensureImageData(x);el('photoPreview').dataset.selected=String(x.id);if(el('photoPreview').dataset.loaded!==String(x.id)){el('photoPreview').dataset.loaded=String(x.id);loadPhoto(x);}}else{el('photoPreview').dataset.loaded='';el('photoPreview').removeAttribute('src');}
 el('ocrBtn').disabled=busy||!valid||!hasPhoto;el('regenBtn').disabled=busy||!valid;el('saveDraft').disabled=busy||!valid;el('publishBtn').disabled=busy||x?.status!=='review';el('rejectBtn').disabled=busy||!valid;el('deleteBtn').disabled=busy||!x||x.status==='sending';
 if(hasPhoto)showImageData();
 el('editorHelp').textContent=state.settings.emergencyStop?'🛑 انتشار اضطراری متوقف شده است.':hasPhoto?(state.settings.photoMode==='card'?'حالت بازسازی: از داده‌های بررسی‌شده، کارت تازه ساخته می‌شود. تصویر جدید نیازمند تشخیص صحیح Entry / SL / TP است.':'ویرایش تصویر روی دستگاه شما انجام می‌شود؛ فایل JPEG در دیتابیس ذخیره نمی‌شود و پس از تأیید مستقیماً به تلگرام می‌رود.'):'اعداد و جزئیات را قبل از انتشار بررسی کنید.';
}

function renderCommandCenter(){
 const x=state.items[0],n=state.items.length,review=state.items.filter(v=>v.status==='review'||v.status==='failed').length,paused=state.settings.emergencyStop===true;
 el('dashStatus').textContent=paused?'● انتشار متوقف':state.settings.autoPublish?'● انتشار سریع فعال':'● انتشار با تأیید دستی';
 el('dashStatus').classList.toggle('paused',paused);
 el('dashPause').classList.toggle('is-paused',paused);
 el('dashPauseText').textContent=paused?'ادامه انتشار':'توقف انتشار';
 const subtitle=document.createElement('small');subtitle.textContent=paused?'رفع توقف اضطراری':'کلید اضطراری';el('dashPauseText').append(subtitle);
 el('dashReviewCount').textContent=review+' نیازمند بررسی';
 const failed=state.items.filter(v=>v.status==='failed').length;
 el('dashRecoveryAlert').hidden=!failed;
 el('dashRecoveryCount').textContent=failed+' پیام با مشکل انتشار';
 el('dashUsage').textContent=n+' / ۵ پیام';el('dashUsageBar').style.width=Math.min(100,n*20)+'%';
 el('dashLatestStatus').textContent=x?statusFa(x.status):'بدون پیام';
 el('dashLatestTitle').textContent=x?itemTitle(x):'هنوز پیامی دریافت نشده است';
 el('dashLatestMeta').textContent=x?'#'+x.id+' • '+(x.has_photo?'تصویری':'متنی')+' • '+(x.category?.kind||'Update'):'برای شروع یک پیام را برای ربات فوروارد کنید.';
 el('dashOpenLatest').disabled=!x;
}
function openCommandInbox(reviewOnly){
 state.filter=reviewOnly?'review':'all';
 document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));
 if(reviewOnly){const first=state.items.find(x=>x.status==='review'||x.status==='failed');if(first)state.selected=first.id;}
 page(reviewOnly?'pro':'inbox');render();
}

function renderIdentityAudit(){
 const x=selected(),container=el('identityAuditList'),info=el('identityAuditState'),note=el('identityAuditNote');
 if(!container||!info||!note)return;
 container.replaceChildren();
 if(!x){info.textContent='در انتظار انتخاب';note.textContent='آیدی‌های متن و OCR در این بخش نمایش داده می‌شوند.';return;}
 const ids=x.identifiers||[],foreign=ids.filter(v=>!v.own);
 const scan=imageData.get(x.id);
 info.textContent=foreign.length+' شناسه خارجی · '+ids.length+' مورد شناسایی‌شده';
 for(const v of ids.slice(0,24)){
  const chip=document.createElement('span');
  chip.className='fx-identity'+(v.own?' own':'')+(v.source==='ocr'?' ocr':'');
  chip.textContent=(v.source==='ocr'?'OCR · ':'')+v.type.toUpperCase()+': '+String(v.value||'').slice(0,110)+(v.own?' ✓':'');
  chip.title=v.own?'شناسه رسمی برند':'شناسه خارجی، بازبینی شود';
  container.append(chip);
 }
 if(x.has_photo){
  const tags=scan?.detected_labels||[];
  for(const label of tags.slice(0,10)){
   const chip=document.createElement('span');chip.className='fx-identity ocr';
   chip.textContent='IMAGE · '+label;container.append(chip);
  }
  note.textContent=scan?.scan_note||'در تصویر، اسکن AI ممکن است متن یا لوگو را از دست بدهد؛ تأیید تصویر قبل از انتشار ضروری است.';
 }else note.textContent=foreign.length?'شناسه‌های خارجی در پیام اصلی پیدا شدند؛ خروجی نهایی باید پاکسازی و قبل از انتشار کنترل شود.':'شناسه خارجی شناسایی نشده است؛ تشخیص خودکار کامل و قطعی نیست.';
}
function homeItem(){return state.items.find(x=>x.status==='review')||state.items.find(x=>x.status==='failed')||state.items[0]||null;}
function homeCanPublish(x){return !!x&&x.status==='review'&&!x.has_photo&&!!x.signal&&!state.settings.emergencyStop&&!busy;}
function setConnection(status){
 const target=el('connectionText');if(!target)return;
 target.textContent=({ready:'پنل متصل',demo:'پیش‌نمایش',locked:'ورود از تلگرام',error:'اتصال ناموفق',loading:'در حال اتصال'})[status]||status;
 el('headerConnection').dataset.status=status;
}
function renderHome(){
 const x=homeItem();
 if(!el('homeSymbol'))return;
 const pending=state.items.filter(i=>['review','failed'].includes(i.status)).length;
 el('homeQueueStatus').textContent=state.settings.emergencyStop?'انتشار متوقف است':pending?pending+' پیام نیازمند بررسی':'صندوق آماده است';
 el('homeQueueCaption').textContent=demo?'حالت نمایشی · انتشار واقعی ندارد':pending?'در انتظار تصمیم شما':'برای دریافت پیام جدید';
 el('homeItemId').textContent=x?'#'+x.id:'—';
 el('homeItemState').textContent=x?statusFa(x.status):'بدون پیام';
 el('homeItemState').dataset.status=x?.status||'empty';
 const ago=x?.created_at?Math.max(0,Math.floor((Date.now()-Number(x.created_at)*1000)/60000)):null;
 el('homeItemAge').textContent=!x?'—':demo?'نمونه نمایشی':ago<1?'همین الان':ago<60?ago+' دقیقه پیش':ago<1440?Math.floor(ago/60)+' ساعت پیش':'پیام اخیر';
 el('homeSymbol').textContent=x?.signal?.symbol|| (x?.has_photo?'پیام تصویری':x?'پیام دریافتی':'منتظر دریافت پیام');
 const side=el('homeSide');side.textContent=x?.signal?.side|| (x?.has_photo?'IMAGE':'REVIEW');side.dataset.side=x?.signal?.side||'OTHER';
 el('homeEntry').textContent=x?.signal?.entryZone||x?.signal?.entry||'—';
 el('homeStop').textContent=x?.signal?.sl||'—';
 const targets=el('homeTargets');targets.replaceChildren();
 if(x?.signal?.tps?.some(Number.isFinite)){
  for(const [i,price] of x.signal.tps.entries()){
   if(!Number.isFinite(price))continue;
   const t=document.createElement('div'),label=document.createElement('span'),number=document.createElement('strong');
   label.textContent='TP'+(i+1);number.textContent=String(price);t.append(label,number);targets.append(t);
  }
 }else{const t=document.createElement('span');t.textContent='اطلاعات تارگت در دسترس نیست';targets.append(t);}
 el('homeExcerpt').textContent=String(x?.draft_text||x?.original_text||'برای شروع یک پیام را به ربات ارسال کنید.').slice(0,380);
 const risk=el('homeSafety');risk.dataset.level=!x?'idle':x.status==='failed'?'error':x.has_photo?'review':x.signal?'ready':'review';
 el('homeSafetyText').textContent=!x?'دستیار آماده دریافت پیام است.':x.status==='sent'?'این پیام قبلاً منتشر شده است.':x.status==='failed'?'وضعیت ارسال نیازمند بررسی در Pro است.':x.has_photo?'تصویر پیش از انتشار به تأیید دستی نیاز دارد.':x.signal?'فیلدهای معاملاتی تشخیص داده شده‌اند؛ پیش از انتشار بررسی کنید.':'پیام باید در بخش Pro بازبینی شود.';
 const can=homeCanPublish(x),publish=el('homePublish');
 publish.disabled=!x||busy||x.status==='sent'||x.status==='sending'||state.settings.emergencyStop;
 publish.textContent=!x?'↗ انتشار':can?'↗ انتشار':x?.has_photo?'◉ بازبینی تصویر':'◉ بررسی در Pro';
 el('homeEdit').disabled=!x||busy;
 el('homePreview').disabled=!x||busy;
 el('homeGuardTitle').textContent=state.settings.emergencyStop?'انتشار اضطراری متوقف است': 'کنترل محتوا فعال است';
 el('homeGuardDetails').textContent= x?.has_photo?'OCR و پاکسازی تصویری تنها پس از تأیید شما قابل انتشارند.':'کنترل شناسه‌های خارجی و جلوگیری از انتشار تکراری فعال است.';
}

function render(){renderCommandCenter();updateTotals();renderList();renderEditor();renderIdentityAudit();fastMode.render();renderHome();}
function page(input){
 const name=input==='dashboard'?'home':input==='inbox'?inboxMode:input;
 if(!['home','fast','pro','settings'].includes(name))return;
 if(name==='fast'||name==='pro')inboxMode=name;
 state.page=name;
 document.body.dataset.workspace=name;
 for(const p of document.querySelectorAll('.page'))p.classList.toggle('active',p.id===name);
 for(const b of document.querySelectorAll('[data-page]')){
  const dest=b.dataset.page;
  const isNav=dest==='inbox'?(name==='fast'||name==='pro'):dest==='home'?name==='home':dest==='settings'?name==='settings':dest===name;
  b.classList.toggle('active',isNav);
  if(b.classList.contains('nav-btn')||b.closest('.bottomnav')){if(isNav)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 }
 el('pageTitle').textContent=({home:'دستیار کانال',fast:'صندوق پیام‌ها',pro:'ویرایش حرفه‌ای',settings:'تنظیمات'})[name];
 el('workbench').style.display=name==='pro'?'grid':'none';
 el('tipline').style.display='none';
 el('assistantModeSwitch').style.display=(name==='fast'||name==='pro')?'grid':'none';
 if(name==='pro'||name==='fast')window.scrollTo({top:0,behavior:'smooth'});
}

async function api(path,{method='GET',body}={}){const res=await fetch(path,{method,headers:{'X-Telegram-Init-Data':telegram?.initData||'',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const data=await res.json().catch(()=>({error:'Invalid response'}));if(!res.ok)throw Error(data.error||'Connection failed');return data;}
async function load(){if(demo){state.items=structuredClone(samples);state.selected=state.items[0].id;setConnection('demo');render();return;}
 if(!telegram?.initData){setConnection('locked');el('itemList').innerHTML='<div class="noitems">🔒<br>برای ورود امن، این پنل را از منوی ربات تلگرام باز کنید.<br><small>برای پیش‌نمایش ظاهری می‌توانید پارامتر ?demo=1 را به آدرس اضافه کنید.</small></div>';el('draftView').textContent='Access requires verified Telegram Mini App session.';return;}
 try{const data=await api('/api/bootstrap');const prior=state.items.find(v=>v.id===state.selected);state.items=data.items||[];state.settings=data.settings||state.settings;const current=state.items.find(v=>v.id===state.selected);if(prior&&prior.status!=='sent'&&current?.status==='sent'){state.filter='sent';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='sent'));toast('✅ پیام منتشر شد.');}state.selected=state.selected&&state.items.some(x=>x.id===state.selected)?state.selected:state.items[0]?.id;setConnection('ready');syncSettings();render();}catch(e){setConnection('error');toast('خطا: '+e.message);}}

function smartSettings(overrides={}){
 return {brandName:el('brandName').value.trim(),website:el('website').value.trim(),handle:el('handle').value.trim(),watermark:state.settings.watermark,photoMode:state.settings.photoMode,autoPublish:state.settings.autoPublish,emergencyStop:state.settings.emergencyStop===true,duplicateGuard:state.settings.duplicateGuard!==false,strictValidation:state.settings.strictValidation!==false,identityGuard:state.settings.identityGuard!==false,scanDepth:el('scanDepth').value,...overrides};
}
async function updateSmartSetting(key){
 if(busy)return;
 const next=key==='emergencyStop'?state.settings.emergencyStop!==true:state.settings[key]===false;
 const settings=smartSettings({[key]:next});
 if(!settings.brandName||!/^https:\/\//.test(settings.website)){toast('تنظیمات برند نامعتبر است.');return;}
 try{
  if(demo)Object.assign(state.settings,settings);
  else state.settings=(await api('/api/settings',{method:'POST',body:settings})).settings;
  syncSettings();renderEditor();
  toast(key==='emergencyStop'?(next?'🛑 انتشار اضطراری متوقف شد.':'✅ انتشار دوباره فعال شد.'):'تنظیمات ذخیره شد.');
 }catch(e){toast('خطا: '+e.message);}
}
async function smartContentAction(action,data={}){
 const x=selected();if(!x||busy||demo)return;
 if(!['review','failed'].includes(x.status)&&action!=='edit-published'){toast('این پیام دیگر قابل بازنویسی نیست.');return;}
 if(state.isEditing&&action!=='edit-published'){toast('ابتدا متن ویرایش‌شده را ذخیره کنید.');return;}
 setBusy(true);
 try{
  const r=await api('/api/items/'+x.id+'/'+action,{method:'POST',body:data});
  if(r.item){const i=state.items.findIndex(v=>v.id===x.id);if(i>=0)state.items[i]=r.item;}
  if(action==='edit-published')setEdit(false);
  render();toast(action==='edit-published'?'✅ پیام کانال ویرایش شد.':action==='assist'?'✅ خروجی AI آماده بررسی است.':'قالب جدید آماده شد.');
 }catch(e){toast('خطا: '+e.message);}finally{setBusy(false);renderEditor();}
}

function syncSettings(){el('brandName').value=state.settings.brandName;el('website').value=state.settings.website;el('handle').value=state.settings.handle||'';el('cardModeToggle').classList.toggle('on',state.settings.photoMode==='card');el('cardModeToggle').setAttribute('aria-pressed',String(state.settings.photoMode==='card'));el('watermarkToggle').classList.toggle('on',state.settings.watermark);el('watermarkToggle').setAttribute('aria-pressed',String(state.settings.watermark));el('autoPublishToggle').classList.toggle('on',Boolean(state.settings.autoPublish));el('autoPublishToggle').setAttribute('aria-pressed',String(Boolean(state.settings.autoPublish)));el('scanDepth').value=state.settings.scanDepth==='deep'?'deep':'balanced';for(const [key,id] of [['emergencyStop','emergencyStopToggle'],['duplicateGuard','duplicateGuardToggle'],['strictValidation','strictValidationToggle'],['identityGuard','identityGuardToggle']]){const v=key==='emergencyStop'?state.settings[key]===true:state.settings[key]!==false;el(id).classList.toggle('on',v);el(id).setAttribute('aria-pressed',String(v));}el('licenseChip').textContent=state.settings.authorized?'White-label':'Source credit';el('licenseInfo').textContent=state.settings.authorized?'مجوز اختصاصی White-label فعال است.':'نام منبع تا زمان ثبت مجوز حفظ می‌شود.';renderCommandCenter();}
async function mutation(action,body={}){const x=selected();if(!x||busy)return;const returnPage=state.page;setBusy(true);try{if(demo){const a=state.items.find(v=>v.id===x.id);if(action==='edit')a.draft_text=body.text;if(action==='reject')a.status='rejected';if(action==='publish')a.status='sent';if(action==='regenerate')a.draft_text=a.draft_text.replace(/\s*$/,'');if(action==='ocr'){a.ocr_text=a.ocr_text||'XAUUSD SELL 3908 SL 3915 TP1 3903';toast('متن نمونه OCR بارگذاری شد.');}if(action==='publish')toast('فقط پیش‌نمایش: ارسال واقعی انجام نشد.');else toast('تغییر نمونه اعمال شد.');}

 else{
  let data;
  if(action==='publish'&&x.has_photo){
   const cfg=imageData.get(x.id);
   if(cfg?.scan_status!=='approved')throw Error('ابتدا عکس ویرایش‌شده را تأیید کنید.');
   const file=await drawCleanedJPEG(x,cfg);
   const res=await fetch('/api/items/'+x.id+'/publish-image',{method:'POST',headers:{'Content-Type':'image/jpeg','X-Telegram-Init-Data':telegram?.initData||''},body:file});
   data=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(data.error||'خطای انتشار تصویر');
   editedPhotoCache.delete(x.id);
  }else data=await api('/api/items/'+x.id+'/'+action,{method:'POST',body});
  if(data.item){const idx=state.items.findIndex(v=>v.id===x.id);state.items[idx]=data.item;}
  else if(action==='reject')state.items.find(v=>v.id===x.id).status='rejected';
  if(action==='publish'){state.filter='sent';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='sent'));}toast(action==='publish'?'✅ انتشار موفق؛ پیام در بخش منتشرشده ثبت شد.':'ذخیره شد.');
 }

 setEdit(false);render();if(action==='publish'&&!demo){await load();page(returnPage==='home'?'home':returnPage==='pro'?'pro':'fast');}}catch(e){toast('خطا: '+e.message);if(action==='publish'&&!demo){try{await load();page(returnPage==='home'?'home':returnPage==='pro'?'pro':'fast');}catch{}}}finally{setBusy(false);renderEditor();}}
async function askDelete(s){if(telegram?.showConfirm)return new Promise(r=>{try{telegram.showConfirm(s,r);}catch{r(confirm(s));}});return confirm(s);}
async function delSelected(){const x=selected();if(!x||busy||x.status==='sending')return;if(!await askDelete('پیام #'+x.id+' از صندوق حذف شود؟ این کار پیام منتشرشده در کانال را پاک نمی‌کند.'))return;setBusy(true);try{if(!demo)await api('/api/items/'+x.id,{method:'DELETE'});state.items=state.items.filter(t=>t.id!==x.id);state.selected=state.items[0]?.id??null;setEdit(false);toast('پیام حذف شد.');}catch(e){toast('خطا: '+e.message);}finally{setBusy(false);render();}}
async function delAll(){if(!state.items.length||busy)return;if(!await askDelete('تمام پیام‌های صندوق حذف شوند؟ این کار قابل بازگشت نیست و پیام‌های کانال پاک نمی‌شوند.'))return;setBusy(true);try{if(!demo)await api('/api/items',{method:'DELETE'});state.items=[];state.selected=null;setEdit(false);toast('تمام پیام‌ها حذف شدند.');}catch(e){toast('خطا: '+e.message);}finally{setBusy(false);render();}}
function modal(open){el('confirmModal').classList.toggle('show',open);el('confirmModal').setAttribute('aria-hidden',String(!open));}
for(const b of document.querySelectorAll('[data-page]'))b.addEventListener('click',()=>page(b.dataset.page));for(const b of document.querySelectorAll('[data-filter]'))b.addEventListener('click',()=>{state.filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderList();});
el('deleteBtn').addEventListener('click',delSelected);el('deleteAllBtn').addEventListener('click',delAll);
for(const key of ['emergencyStop','duplicateGuard','strictValidation','identityGuard'])el(key+'Toggle').addEventListener('click',()=>updateSmartSetting(key));
el('autoPublishToggle').addEventListener('click',async()=>{if(busy)return;const next=!state.settings.autoPublish;const fields={brandName:el('brandName').value.trim(),website:el('website').value.trim(),handle:el('handle').value.trim(),watermark:state.settings.watermark,photoMode:state.settings.photoMode,autoPublish:next,emergencyStop:state.settings.emergencyStop===true,duplicateGuard:state.settings.duplicateGuard!==false,strictValidation:state.settings.strictValidation!==false,identityGuard:state.settings.identityGuard!==false,scanDepth:el('scanDepth').value};if(!fields.brandName||!/^https:\/\//.test(fields.website)){toast('تنظیمات برند را اصلاح کنید.');return;}try{if(demo)state.settings.autoPublish=next;else state.settings=(await api('/api/settings',{method:'POST',body:fields})).settings;syncSettings();toast(next?'⚡ انتشار سریع فعال شد.':'انتشار سریع غیرفعال شد.');}catch(e){toast('خطا: '+e.message);}});
el('cropTop').addEventListener('input',()=>cropInput('trim_top'));el('cropBottom').addEventListener('input',()=>cropInput('trim_bottom'));el('visualOverlay').addEventListener('pointerdown',visualPointerStart);el('visualOverlay').addEventListener('pointermove',visualPointerMove);el('visualOverlay').addEventListener('pointerup',visualPointerEnd);el('visualOverlay').addEventListener('pointercancel',()=>{visualState.drawing=null;renderVisualEditor();});
el('scanImageBtn').addEventListener('click',()=>imageAction('scan'));el('saveImageBtn').addEventListener('click',()=>imageAction('save'));el('approveImageBtn').addEventListener('click',()=>imageAction('approve'));el('addMaskBtn').addEventListener('click',addMask);el('undoMaskBtn').addEventListener('click',()=>{const d=imageData.get(selected()?.id);if(d){d.redactions=(d.redactions||[]).slice(0,-1);visualInvalidate(selected(),d);}});
 el('reloadBtn').addEventListener('click',()=>load());el('tabEdit').addEventListener('click',()=>{if(!selected())return;setEdit(true);el('draftEdit').value=selected().draft_text;});el('tabPreview').addEventListener('click',()=>{if(state.isEditing && el('draftEdit').value!==selected()?.draft_text){toast('ابتدا تغییرات متن را ذخیره کنید.');return;}setEdit(false);});
el('applyTemplateBtn').addEventListener('click',()=>smartContentAction('template',{template:el('templatePicker').value}));
 for(const b of document.querySelectorAll('[data-ai-mode]'))b.addEventListener('click',()=>smartContentAction('assist',{mode:b.dataset.aiMode}));
 el('editPublishedBtn').addEventListener('click',()=>smartContentAction('edit-published',{text:el('draftEdit').value}));
el('ocrBtn').addEventListener('click',()=>mutation('ocr'));el('regenBtn').addEventListener('click',()=>mutation('regenerate'));el('saveDraft').addEventListener('click',()=>mutation('edit',{text:el('draftEdit').value}));el('rejectBtn').addEventListener('click',()=>mutation('reject'));
el('publishBtn').addEventListener('click',()=>{if(state.isEditing){toast('اول متن را ذخیره کنید.');return;}const x=selected();if(x?.status==='review')mutation('publish');});el('cancelPublish').addEventListener('click',()=>modal(false));el('confirmPublish').addEventListener('click',()=>{modal(false);mutation('publish');});
el('confirmModal').addEventListener('click',e=>{if(e.target===el('confirmModal'))modal(false);});
el('watermarkToggle').addEventListener('click',()=>{state.settings.watermark=!state.settings.watermark;syncSettings();renderEditor();});
el('cardModeToggle').addEventListener('click',()=>{state.settings.photoMode=state.settings.photoMode==='card'?'watermark':'card';syncSettings();renderEditor();});
el('saveSettings').addEventListener('click',async()=>{const fields={brandName:el('brandName').value.trim(),website:el('website').value.trim(),handle:el('handle').value.trim(),watermark:state.settings.watermark,photoMode:state.settings.photoMode,autoPublish:state.settings.autoPublish,emergencyStop:state.settings.emergencyStop===true,duplicateGuard:state.settings.duplicateGuard!==false,strictValidation:state.settings.strictValidation!==false,identityGuard:state.settings.identityGuard!==false,scanDepth:el('scanDepth').value};if(!fields.brandName||!/^https:\/\//.test(fields.website)){toast('نام برند و وب‌سایت HTTPS لازم هستند.');return;}
 try{if(demo){Object.assign(state.settings,fields);toast('تنظیمات نمایشی ذخیره شد.');}else{const r=await api('/api/settings',{method:'POST',body:fields});state.settings=r.settings;toast('تنظیمات برند ذخیره شد.');}syncSettings();renderEditor();}catch(e){toast('خطا: '+e.message);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy&&!state.isEditing)load();});window.addEventListener('focus',()=>{if(!busy&&!state.isEditing)load();});setInterval(()=>{if(!document.hidden&&!busy&&!state.isEditing&&!demo)load();},30000);
el('recoveryRefresh').addEventListener('click',()=>load());el('recoveryPrepare').addEventListener('click',recoverCurrentPost);
el('dashRecoveryOpen').addEventListener('click',()=>{const failed=state.items.find(x=>x.status==='failed');if(failed)state.selected=failed.id;openCommandInbox(true);});
el('dashGoReview').addEventListener('click',()=>openCommandInbox(true));
el('dashGoInbox').addEventListener('click',()=>openCommandInbox(false));
el('dashGoSettings').addEventListener('click',()=>page('settings'));
el('dashPause').addEventListener('click',()=>updateSmartSetting('emergencyStop'));
el('dashOpenLatest').addEventListener('click',()=>{const x=state.items[0];if(!x)return;state.selected=x.id;openCommandInbox(false);if(window.innerWidth<700)el('previewBox').scrollIntoView({behavior:'smooth',block:'start'});});
function showHomeItem(inEdit=false){
 const x=homeItem();if(!x)return;
 state.selected=x.id;page('pro');setEdit(inEdit);render();
 if(window.innerWidth<740){requestAnimationFrame(()=>el('previewBox').scrollIntoView({behavior:'smooth',block:'start'}));}
}
el('homeOpenInbox').addEventListener('click',()=>page('inbox'));
el('homeEdit').addEventListener('click',()=>showHomeItem(true));
el('homePreview').addEventListener('click',()=>showHomeItem(false));
el('homePublish').addEventListener('click',async()=>{
 if(busy)return;
 const x=homeItem();if(!x)return;
 if(!homeCanPublish(x)){showHomeItem(false);return;}
 state.selected=x.id;setEdit(false);await mutation('publish');
});
fastMode.init();page('home');setConnection('loading');syncSettings();renderHome();load();
