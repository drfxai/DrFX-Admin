import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {drfxReviewWidgetHtml,drfxPhotoReviewWidgetHtml,drfxReviewChatData} from '../src/worker-runtime.mjs';

function boot(data,responses={},widgetHtml=drfxReviewWidgetHtml()){
 const elements=new Map(),events=new Map(),actions=[],links=[];
 const get=id=>{if(!elements.has(id))elements.set(id,{textContent:'',className:'',hidden:false,disabled:false});return elements.get(id)};
 const TelegramWidget={
  chatData:data,
  ready(){actions.push('ready')},
  onEvent(k,fn){events.set(k,fn)},
  openTelegramLink(url){links.push(url)},
  request(action){actions.push(action);return Promise.resolve({result:JSON.stringify(responses[action]||{message:'Received'})})}
 };
 const scripts=[...widgetHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1,'one self-contained script');
 vm.runInNewContext(scripts[0][1],{document:{getElementById:get},window:{TelegramWidget}},{timeout:1000});
 return {get,events,actions,links,TelegramWidget};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const row={id:17,status:'review',file_id:null,draft_text:'GOLD BUY ENTRY 4075 SL 4065 TP1 4085',signal_json:JSON.stringify({symbol:'XAUUSD',side:'BUY',entry:4075,sl:4065,tps:[4085]})};

for(const html of [drfxReviewWidgetHtml(),drfxPhotoReviewWidgetHtml()]){
 test('widget has exactly three visible primary actions',()=>{
  const top=html.match(/<div class="buttons"><button class="main" id="approve">[\s\S]*?<\/div>/);
  assert.ok(top,'expected compact three-action row');
  assert.deepEqual([...top[0].matchAll(/id="([^"]+)"/g)].map(x=>x[1]),['approve','edit','delete']);
  assert.ok(html.includes('TelegramWidget'));
 });
}

test('trade widget renders real recorded prices and never publishes without admin feature flag',()=>{
 const w=boot(drfxReviewChatData(row,false));
 assert.equal(w.get('symbol').textContent,'XAUUSD');
 assert.equal(w.get('entry').textContent,'4075');
 assert.equal(w.get('sl').textContent,'4065');
 assert.equal(w.get('approve').disabled,false);
 w.get('approve').onclick();
 assert.equal(w.links.length,1);
 assert.equal(w.actions.includes('drfx:publish:17'),false);
});
test('Quick Publish sends exactly one native callback on first tap when authorized',async()=>{
 const w=boot(drfxReviewChatData(row,true,true),{'drfx:publish:17':{status:'sent',message:'Published'}});
 assert.equal(w.get('approve').textContent,'⚡ Quick Publish');
 w.get('approve').onclick();
 assert.ok(w.actions.includes('drfx:publish:17'));
 await tick();
 assert.equal(w.get('state').textContent,'SENT');
 assert.equal(w.get('approve').disabled,true);
});
test('Delete is a native callback and marks the card deleted',async()=>{
 const w=boot(drfxReviewChatData(row,false),{'drfx:delete:17':{status:'deleted',message:'Removed from bot inbox only'}});
 w.get('delete').onclick();await tick();
 assert.ok(w.actions.includes('drfx:delete:17'));
 assert.equal(w.get('state').textContent,'DELETED');
 assert.equal(w.get('delete').disabled,true);
});
test('Edit opens private Admin Mini App for either text or image',()=>{
 for(const html of [drfxReviewWidgetHtml(),drfxPhotoReviewWidgetHtml()]){
  const data=drfxReviewChatData({...row,file_id:html===drfxReviewWidgetHtml()?null:'photo_file'},false);
  const w=boot(data,{},html);
  w.get('edit').onclick();
  assert.equal(w.links.length,1);
  assert.match(w.links[0],/https:\/\/t\.me\/drfxa_bot\?startapp=review/);
 }
});
test('approved photo offers immediate publication; unapproved photo redirects to editor',async()=>{
 const img={...row,file_id:'photo_id'};
 const approved=boot(drfxReviewChatData(img,true,true),{'drfx:publish:17':{status:'sent'}},drfxPhotoReviewWidgetHtml());
 approved.get('approve').onclick();await tick();
 assert.ok(approved.actions.includes('drfx:publish:17'));
 const unapproved=boot(drfxReviewChatData(img,true,false),{},drfxPhotoReviewWidgetHtml());
 unapproved.get('approve').onclick();
 assert.equal(unapproved.links.length,1);
 assert.equal(unapproved.actions.includes('drfx:publish:17'),false);
});
test('Telegram chatDataChanged updates state without any extra request',()=>{
 const w=boot(drfxReviewChatData(row));
 w.TelegramWidget.chatData=drfxReviewChatData({...row,status:'sent'});
 w.events.get('chatDataChanged')();
 assert.equal(w.get('state').textContent,'SENT');
 assert.deepEqual(w.actions,['ready']);
});
