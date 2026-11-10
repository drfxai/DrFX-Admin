import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {autoImageCandidate,autoAnnouncementPhotoReady} from '../dist/worker.mjs';
const code=readFileSync(new URL('../src/worker-runtime.mjs',import.meta.url),'utf8');
const ui=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const quick=readFileSync(new URL('../web/fast-pro.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const same='GOLD BUY ENTRY 4075 SL 4065 TP1 4085 TP2 4090';
test('two matching independent OCR transcriptions permit clean-room trade card',()=>{
 assert.ok(autoImageCandidate({original_text:''},same,same));
 assert.equal(autoImageCandidate({original_text:''},same,'GOLD BUY ENTRY 4075 SL 4065 TP1 4086 TP2 4090'),null);
 assert.equal(autoImageCandidate({original_text:''},same,''),null);
});
test('caption and OCR must agree on every price field',()=>{
 assert.ok(autoImageCandidate({original_text:same},same,''));
 assert.equal(autoImageCandidate({original_text:'GOLD BUY ENTRY 4075 SL 4065 TP1 4088 TP2 4090'},same,same),null);
 assert.equal(autoImageCandidate({original_text:same},same.replace('BUY','SELL'),same),null);
 assert.equal(autoImageCandidate({original_text:same},same+' LIMIT ORDER',same),null);
});
test('automatic image notices require independent cross-checks with no external identities',()=>{
 const notice='Market update: Gold traded sideways through the European session while investors awaited U.S. inflation data.';
 const item={original_text:notice},fresh={ocr_text:notice};
 const cfg={scan_status:'needs_review',redactions:[],detected_labels:[],scan_note:'No detected external branding'};
 assert.equal(autoAnnouncementPhotoReady(item,fresh,cfg),true);
 assert.equal(autoAnnouncementPhotoReady(item,{ocr_text:'unrelated advert content no numbers'},cfg),false);
 assert.equal(autoAnnouncementPhotoReady({original_text:notice+' @BadMarketSignal'},fresh,cfg),false);
 assert.equal(autoAnnouncementPhotoReady(item,fresh,{...cfg,redactions:[{x:.1,y:.1,w:.1,h:.1}]}),false);
});
test('image auto publishing builds a fresh original card and cannot auto-retry uncertain sends',()=>{
 assert.match(code,/await createSignalCard\\(env,current,s\\)/);
 assert.match(code,/scan_status:'approved'/);
 assert.match(code,/function sameTrade\\(/);
 assert.match(code,/const stamp=Number\\(m\\.forward_origin\\?\\.date\\|\\|m\\.date\\|\\|0\\)/);
 assert.match(code,/if\\(!current\\|\\|current\\.status!=='review'\\)return/);
 assert.match(code,/await publishRow\\(env,fresh,s,false,ready\\.photo\\)/);
});
test('Home and Fast use exactly three actions and same authenticated one-tap route',()=>{
 for(const id of ['homePublish','homeEdit','homeDelete'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 for(const action of ['publish','inspect','delete'])assert.match(quick,new RegExp('data-fx="'+action+'"'));
 assert.match(ui,/function quickPublish\\(id\\)/);
 assert.match(ui,/quick-publish/);
 assert.match(ui,/remove:async\\(id\\)/);
 assert.match(ui,/widgetItemId/);
});
test('private bot widget and fallback offer quick publish, edit and delete',()=>{
 assert.match(code,/function drfxThreeActions\\(item,origin\\)/);
 assert.match(code,/callback_data:'pub:'/);
 assert.match(code,/callback_data:'del:'/);
 assert.match(code,/web_app:\\{url:url\\+'\\/\\?mode=pro&item='/);
 assert.match(code,/match\\(\\/\\^\\(pub\\|del\\):/);
 assert.match(code,/drfxThreeActions\\(current\\|\\|item/);
 assert.match(code,/drfxReviewChatData\\(item,active,true\\)/);
});
test('security controls still apply to unattended text and image publication',()=>{
 assert.match(code,/ADMIN_TELEGRAM_USER_ID/);
 assert.match(code,/if\\(s\\.emergencyStop\\)/);
 assert.match(code,/s\\.duplicateGuard/);
 assert.match(code,/if\\(s\\.strictValidation!==false/);
 assert.match(code,/if\\(s\\.identityGuard!==false/);
 assert.match(code,/status='sending'/);
});
