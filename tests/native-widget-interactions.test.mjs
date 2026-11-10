import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {drfxReviewWidgetHtml,drfxReviewChatData} from '../src/worker-runtime.mjs';

function boot(data,responses={}){
 const elements=new Map(),events=new Map(),actions=[],links=[];
 const get=id=>{if(!elements.has(id))elements.set(id,{textContent:'',className:'',hidden:false,disabled:false});return elements.get(id)};
 const TelegramWidget={
  chatData:data,
  ready(){actions.push('ready')},
  onEvent(k,fn){events.set(k,fn)},
  openTelegramLink(url){links.push(url)},
  request(action){actions.push(action);return Promise.resolve({result:JSON.stringify(responses[action]||{message:'Received'})})}
 };
 const html=drfxReviewWidgetHtml();
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1,'one self-contained script');
 vm.runInNewContext(scripts[0][1],{document:{getElementById:get},window:{TelegramWidget}},{timeout:1000});
 return {get,events,actions,links,TelegramWidget};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const row={id:17,status:'review',file_id:null,draft_text:'GOLD BUY ENTRY 4075 SL 4065 TP1 4085',signal_json:JSON.stringify({symbol:'XAUUSD',side:'BUY',entry:4075,sl:4065,tps:[4085]})};
test('admin widget shows parsed prices, but never sends an unapproved channel publish',()=>{
 const w=boot(drfxReviewChatData(row));
 assert.equal(w.get('symbol').textContent,'XAUUSD');
 assert.equal(w.get('entry').textContent,'4075');
 assert.equal(w.get('sl').textContent,'4065');
 assert.equal(w.get('approve').disabled,false);
 assert.equal(w.get('publishArea').hidden,true);
 assert.deepEqual(w.actions,['ready']);
});
test('admin owner must confirm twice before making a native publish request',async()=>{
 const w=boot(drfxReviewChatData(row,true),{'drfx:publish:17':{status:'sent',message:'Published'}});
 assert.equal(w.get('approve').disabled,false);
 w.get('approve').onclick();
 assert.equal(w.get('publishArea').hidden,false);
 assert.ok(!w.actions.includes('drfx:publish:17'));
 w.get('cancel').onclick();
 assert.equal(w.get('publishArea').hidden,true);
 w.get('approve').onclick();
 w.get('publish').onclick();await tick();
 assert.ok(w.actions.includes('drfx:publish:17'));
 assert.equal(w.get('state').textContent,'SENT');
 assert.equal(w.get('publishArea').hidden,true);
});
test('reject calls the correct native query, and images remain Mini App only',async()=>{
 const w=boot(drfxReviewChatData(row),{'drfx:reject:17':{status:'rejected',message:'Rejected'}});
 w.get('reject').onclick();await tick();
 assert.ok(w.actions.includes('drfx:reject:17'));
 assert.equal(w.get('reject').disabled,true);
 const photo=boot(drfxReviewChatData({...row,file_id:'photo_id'},true));
 assert.equal(photo.get('approve').disabled,false);
 photo.get('edit').onclick();
 assert.equal(photo.links.length,1);
 assert.match(photo.links[0],/^https:\/\/t\.me\//);
});
test('Telegram chatDataChanged updates a card in place without a request',()=>{
 const w=boot(drfxReviewChatData(row));
 w.TelegramWidget.chatData=drfxReviewChatData({...row,status:'sent'});
 w.events.get('chatDataChanged')();
 assert.equal(w.get('state').textContent,'SENT');
 assert.deepEqual(w.actions,['ready']);
});


test('Review opens Admin Mini App when widget publication is off',()=>{
 const w=boot(drfxReviewChatData(row,false));
 w.get('approve').onclick();
 assert.equal(w.links.length,1);
 assert.match(w.links[0],/t\.me\/drfxa_bot\?startapp=review/);
 assert.ok(!w.actions.some(x=>String(x).includes('publish')));
});

test('status query reports the authoritative state without publishing',async()=>{
 const w=boot(drfxReviewChatData(row,false),{'drfx:status:17':{status:'review',message:'Current status: review'}});
 w.get('refresh').onclick();await tick();
 assert.ok(w.actions.includes('drfx:status:17'));
 assert.equal(w.get('publishArea').hidden,true);
 assert.equal(w.get('notice').textContent,'Current status: review');
});

test('approved photos show quick publishing confirmation, unapproved photos open editor',()=>{
 const approved=boot(drfxReviewChatData({...row,file_id:'photo_id'},true,true),{'drfx:publish:17':{status:'sent',message:'Published'}});
 assert.equal(approved.get('approve').textContent,'⚡ Quick Publish');
 approved.get('approve').onclick();
 assert.equal(approved.get('publishArea').hidden,false);
 assert.ok(!approved.actions.includes('drfx:publish:17'));
 approved.get('publish').onclick();
 const pending=boot(drfxReviewChatData({...row,file_id:'photo_id'},true,false));
 assert.equal(pending.get('approve').textContent,'↗ Review in Admin');
 pending.get('approve').onclick();
 assert.equal(pending.links.length,1);
});
