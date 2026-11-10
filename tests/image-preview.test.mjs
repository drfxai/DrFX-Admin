import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const worker=read('src/worker-runtime.mjs'),html=read('web/index.html'),ui=read('web/app.js'),css=read('web/media-fix.css');
const a=worker.indexOf('function imageMime(bytes){'),b=worker.indexOf('\nasync function downloadPhoto(env,fileId){',a);
assert.ok(a>=0&&b>a,'image helpers must exist');
const pure=vm.runInNewContext(worker.slice(a,b)+'\n({imageMime,telegramImageId})',{Uint8Array,Number,String});
const mime=blob=>pure.imageMime(Uint8Array.from(blob));
test('accepts JPEG PNG WebP magic bytes, not arbitrary or SVG data',()=>{
 assert.equal(mime([255,216,255,222,11,22]),'image/jpeg');
 assert.equal(mime([137,80,78,71,13,10,26,10,1]),'image/png');
 assert.equal(mime([82,73,70,70,12,0,0,0,87,69,66,80,7]),'image/webp');
 assert.equal(mime([60,115,118,103,62,1,2,3,4,5]),null);
});
test('photo and image-document identification with MIME and size checks',()=>{
 assert.equal(pure.telegramImageId({photo:[{file_id:'small'},{file_id:'large'}]}),'large');
 assert.equal(pure.telegramImageId({document:{mime_type:'image/png',file_size:200000,file_id:'png-doc'}}),'png-doc');
 assert.equal(pure.telegramImageId({document:{mime_type:'image/jpeg',file_id:'jpg-doc'}}),'jpg-doc');
 assert.equal(pure.telegramImageId({document:{mime_type:'application/pdf',file_id:'pdf'}}),null);
 assert.equal(pure.telegramImageId({document:{mime_type:'image/svg+xml',file_id:'svg'}}),null);
 assert.equal(pure.telegramImageId({document:{mime_type:'image/png',file_size:9000000,file_id:'huge'}}),null);
});
test('authenticated source-image API identifies MIME and uses private cache',()=>{
 assert.match(worker,/const photo=telegramImageId\(m\)/);
 assert.match(worker,/action==='source-image'/);
 assert.match(worker,/'content-type':imageMime\(bytes\)/);
 assert.match(worker,/private,no-store/);
 assert.match(worker,/x-content-type-options':'nosniff'/);
 assert.match(worker,/path\.includes\('\.\.'\)/);
});
test('Home image uses private blob URLs, retry and cleanup',()=>{
 for(const id of ['homeSourceImage','homeMediaPanel','homeArtFallback','homeMediaState','homeMediaRetry','homeOcrStatus'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(ui,/fetch\('\/api\/items\/'\+encodeURIComponent\(target\)\+'\/source-image'/);
 assert.match(ui,/'X-Telegram-Init-Data':telegram\.initData/);
 assert.match(ui,/URL\.createObjectURL\(blob\)/);
 assert.match(ui,/URL\.revokeObjectURL\(homeMedia\.url\)/);
 assert.match(ui,/homeMedia\.controller\?\.abort\(\)/);
 assert.match(ui,/loadHomeSource\(x\)/);
 assert.match(ui,/loadHomeSource\(x,\{retry:true\}\)/);
 assert.match(css,/\.assistant-featured-body\.is-image/);
 assert.match(css,/#homeSourceImage/);
});
test('Balanced and Deep scanning attempt OCR before admin-verified publication',()=>{
 assert.match(worker,/async function recognizeImageText\(env,dataUrl\)/);
 assert.match(worker,/ocr=await recognizeImageText\(env,image\)/);
 assert.match(worker,/recognizedSignal=parseSignal/);
 assert.match(worker,/signal_json=COALESCE\(signal_json,\?\)/);
 assert.match(worker,/scan_status:'needs_review'/);
 assert.match(worker,/scanSettings\.scanDepth==='deep'/);
 assert.match(worker,/if\(cfg\.scan_status==='approved'\)return cfg/);
});
test('AI response parser accepts multiple response shapes',()=>{
 const i=worker.indexOf('function visionResponseText(output){'),j=worker.indexOf('\nasync function recognizeImageText',i);
 assert.ok(i>=0&&j>i);
 const parse=vm.runInNewContext(worker.slice(i,j)+'\nvisionResponseText',{String});
 assert.equal(parse({response:'XAUUSD BUY 2500'}),'XAUUSD BUY 2500');
 assert.equal(parse({choices:[{message:{content:'TP1: 2510'}}]}),'TP1: 2510');
 assert.equal(parse({response:[{type:'text',text:'SL: 2485'}]}),'SL: 2485');
 assert.equal(parse({response:{unrecognized:'xyz'}}),'');
});
test('original image preview stays separate from edited JPEG publishing',()=>{
 assert.match(worker,/Edited JPEG required; open Mini App/);
 assert.match(worker,/action==='publish-image'/);
 assert.match(worker,/action==='image'&&row\.file_id/);
});


test('Visual editor retries a failed image load without keeping an empty selection cache',()=>{
 assert.match(ui,/const visualState=\{itemId:null,url:null,drawing:null,loading:false\}/);
 assert.match(ui,/visualState\.itemId===item\.id&&\(visualState\.url\|\|visualState\.loading\|\|demo\)/);
 assert.match(ui,/visualState\.loading=true/);
 assert.match(ui,/visualState\.loading=false/);
 assert.match(ui,/visualState\.itemId=null;/);
 assert.match(ui,/visualState\.url=null;/);
 assert.match(ui,/دوباره تلاش کنید/);
});
