import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {eligibleForAutoContent,autoPhotoSignalReady} from '../dist/worker.mjs';
const code=readFileSync(new URL('../src/worker-runtime.mjs',import.meta.url),'utf8');
const now=()=>Math.floor(Date.now()/1000);

test('recent validated direct text and forwarded trade signals can publish autonomously',()=>{
 const content='GOLD BUY ENTRY 4075 SL 4065 TP1 4085 TP2 4090';
 const signal={symbol:'XAUUSD',side:'BUY',entry:4075,sl:4065,tps:[4085,4090]};
 assert.ok(signal);
 assert.equal(eligibleForAutoContent({text:content,date:now()},signal,null),true);
 assert.equal(eligibleForAutoContent({text:content,forward_origin:{date:now()-60}},signal,null),true);
 assert.equal(eligibleForAutoContent({text:content,forward_origin:{date:now()-9000}},signal,null),false);
 assert.equal(eligibleForAutoContent({text:content,date:now()-2000},signal,null),false);
 assert.equal(eligibleForAutoContent({text:content,date:now()},signal,'photo'),false);
});
test('plain market updates publish only when categorized and free from trades and promotions',()=>{
 assert.equal(eligibleForAutoContent({text:'Market update: Gold is trading in a narrow band after the London session opened.',date:now()},null,null),true);
 assert.equal(eligibleForAutoContent({text:'Market update: BUY NOW ENTRY 4075 without a stop loss',date:now()},null,null),false);
 assert.equal(eligibleForAutoContent({text:'Market update: Follow @fake_signal_room for more analysis.',date:now()},null,null),false);
 assert.equal(eligibleForAutoContent({text:'Come join our affiliate programme tomorrow.',date:now()},null,null),false);
});
test('auto approved photo requires caption and independent OCR to agree on each trade field',()=>{
 const signal='GOLD BUY ENTRY 4075 SL 4065 TP1 4085 TP2 4090 TP3 4100';
 const row={original_text:signal},fresh={ocr_text:signal};
 const clean={scan_status:'needs_review',redactions:[],detected_labels:['trade:unverified'],scan_note:'No external identity seen'};
 assert.equal(autoPhotoSignalReady(row,fresh,clean),true);
 assert.equal(autoPhotoSignalReady({original_text:''},fresh,clean),false);
 assert.equal(autoPhotoSignalReady(row,{ocr_text:'GOLD BUY ENTRY 4075 SL 4065 TP1 4086 TP2 4090 TP3 4100'},clean),false);
 assert.equal(autoPhotoSignalReady(row,fresh,{...clean,redactions:[{x:.1,y:.1,w:.1,h:.1}]}),false);
 assert.equal(autoPhotoSignalReady(row,fresh,{...clean,detected_labels:['scan:partial']}),false);
 assert.equal(autoPhotoSignalReady(row,fresh,{...clean,scan_note:'Automatic verification incomplete: ocr'}),false);
 assert.equal(autoPhotoSignalReady({...row,original_text:signal+'\nFollow @foreign_signals'},fresh,clean),false);
});
test('autonomous photo pipeline is task-scoped, fails closed, and never retries uncertain Telegram delivery',()=>{
 assert.match(code,/const job=drfxAutoPhotoWorkflow\(env,item,m,s/);
 assert.match(code,/if\(ctx\?\.waitUntil\)ctx\.waitUntil\(job\)/);
 assert.match(code,/if\(current\?\.status!=='review'\)return/);
 assert.match(code,/await scanImage\(env,item\)/);
 assert.match(code,/autoPhotoSignalReady\(item,fresh,scan\)/);
 assert.match(code,/await publishRow\(env,current,s,false,cleaned\)/);
 assert.match(code,/if\(!current\|\|current\.status!=='review'\)return/);
 assert.match(code,/status:'approved'/);
 assert.match(code,/scan:partial/);
});
