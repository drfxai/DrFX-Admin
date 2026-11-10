import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {autoImageCandidate,autoAnnouncementPhotoReady} from '../dist/worker.mjs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const worker=read('src/worker-runtime.mjs'),app=read('web/app.js'),fast=read('web/fast-pro.js'),html=read('web/index.html');
const trade='GOLD BUY ENTRY 4075 SL 4065 TP1 4085 TP2 4090';

test('cross-checked OCR enables a new clean-room signal card',()=>{
 assert.ok(autoImageCandidate({original_text:''},trade,trade));
 assert.equal(autoImageCandidate({original_text:''},trade,trade.replace('TP1 4085','TP1 4086')),null);
 assert.equal(autoImageCandidate({original_text:''},trade,''),null);
 assert.ok(autoImageCandidate({original_text:trade},trade,''));
 assert.equal(autoImageCandidate({original_text:trade.replace('SL 4065','SL 4064')},trade,trade),null);
 assert.equal(autoImageCandidate({original_text:trade},trade+' LIMIT ORDER',trade),null);
});
test('non-trading image announcements are verified against their captions and OCR',()=>{
 const s='Market update: Gold traded sideways through the European session while investors awaited U.S. inflation data.';
 const item={original_text:s},fresh={ocr_text:s},cfg={scan_status:'needs_review',redactions:[],detected_labels:[],scan_note:'No detected external branding'};
 assert.equal(autoAnnouncementPhotoReady(item,fresh,cfg),true);
 assert.equal(autoAnnouncementPhotoReady(item,{ocr_text:'Unrelated marketing content that does not match the caption'},cfg),false);
 assert.equal(autoAnnouncementPhotoReady({original_text:s+' @BadMarketSignal'},fresh,cfg),false);
 assert.equal(autoAnnouncementPhotoReady(item,fresh,{...cfg,redactions:[{x:.1,y:.1,w:.1,h:.1}]}),false);
});
test('guarded bot publishing uses a brand-new card and does not retry uncertain sends',()=>{
 for(const needle of [
  'async function prepareAutonomousPhoto(env,item,s',
  'await createSignalCard(env,current,s)',
  "scan_status:'approved'",
  "if(!current||current.status!=='review')return",
  'await publishRow(env,fresh,s,false,ready.photo)',
  'const stamp=Number(m.forward_origin?.date||m.date||0)',
  "const lock=await env.DB.prepare"
 ])assert.ok(worker.includes(needle),needle);
});
test('Home and Fast offer three actions with the same authenticated quick endpoint',()=>{
 for(const id of ['homePublish','homeEdit','homeDelete'])assert.equal(html.split('id="'+id+'"').length-1,1,id);
 for(const action of ['publish','inspect','delete'])assert.ok(fast.includes('data-fx="'+action+'"'));
 for(const needle of ['async function quickPublish(id)','/quick-publish','remove:async(id)','widgetItemId'])assert.ok(app.includes(needle),needle);
});
test('Telegram widget offers publish edit delete to verified administrator only',()=>{
 for(const needle of [
  'function drfxThreeActions(item,origin)',
  "callback_data:'pub:'",
  "callback_data:'del:'",
  "url:url+'/?mode=pro&item='",
  "drfxThreeActions(current||item",
  "drfxReviewChatData(item,active,true)",
  "String(row.admin_id)!==String(q.from.id)",
  "String(row.origin_chat_id)!==String(q.chat.id)"
 ])assert.ok(worker.includes(needle),needle);
});
test('emergency stop and duplicate prevention guard all publication paths',()=>{
 for(const needle of [
  'if(s.emergencyStop)',
  's.duplicateGuard',
  's.identityGuard!==false',
  "status='sending'",
  "strictValidation!==false"
 ])assert.ok(worker.includes(needle),needle);
});
