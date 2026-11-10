import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {drfxReviewWidgetHtml,drfxPhotoReviewWidgetHtml,drfxReviewChatData} from '../src/worker-runtime.mjs';

const source=readFileSync(new URL('../src/worker-runtime.mjs',import.meta.url),'utf8');

test('Telegram 10.4 widget fits both HTML byte limits',()=>{
 const html=drfxReviewWidgetHtml();
 assert.ok(Buffer.byteLength(html,'utf8')<=32768);
 assert.ok(deflateSync(Buffer.from(html),{level:9}).byteLength<=4096);
 assert.match(html,/TelegramWidget/);
 assert.match(html,/\.request\('drfx:'/);
 assert.doesNotMatch(html,/<(?:input|textarea|iframe|script\s+src=)/i);
 assert.doesNotMatch(html,/fetch\s*\(/);
});

test('user message content never becomes HTML/script',()=>{
 const secret='<img src=x onerror=alert(1)>';
 const before=drfxReviewWidgetHtml();
 const data=drfxReviewChatData({id:17,status:'review',draft_text:secret,file_id:null});
 assert.equal(drfxReviewWidgetHtml(),before);
 assert.equal(JSON.parse(data).text,secret);
 assert.ok(Buffer.byteLength(data)<=1024);
 assert.doesNotMatch(before,/onerror=alert/);
});

test('widget callback requires Telegram-authenticated admin and message ownership',()=>{
 assert.match(source,/q\.chat\?\.type==='private'/);
 assert.match(source,/q\.from\?\.id/);
 assert.match(source,/ADMIN_TELEGRAM_USER_ID/);
 assert.match(source,/String\(row\.admin_id\)!==String\(q\.from\.id\)/);
 assert.match(source,/String\(row\.origin_chat_id\)!==String\(q\.chat\.id\)/);
 assert.match(source,/DRFX_WIDGET_PUBLISH_ENABLED!=='true'/);
 assert.match(source,/status='rejected'.+status='review'/);
});

test('existing webhook stays intact and subscribes to widget_query',()=>{
 assert.match(source,/if\(u\.widget_query\)return drfxWidgetQuery/);
 assert.match(source,/if\(u\.callback_query\)/);
 assert.match(source,/allowed_updates:\['message','callback_query','widget_query'\]/);
 assert.match(source,/\/\(\?:review\|widgets\)/);
});

test('Persian, emoji and escaped content always remain below Telegram chat_data limit',()=>{
 const long='طلای جهانی 🚀💎\\n'.repeat(100);
 for(const item of [
  {id:7,status:'review',draft_text:long,file_id:null},
  {id:7,status:'review',draft_text:'\"\\\\'.repeat(600),file_id:null},
  {id:7,status:'review',draft_text:'💎'.repeat(500),file_id:null}
 ]){
  const data=drfxReviewChatData(item);
  assert.ok(Buffer.byteLength(data,'utf8')<=1024);
  assert.equal(JSON.parse(data).publishEnabled,false);
  assert.equal(JSON.parse(drfxReviewChatData(item,true)).publishEnabled,true);
  assert.ok(Buffer.byteLength(drfxReviewChatData(item,true),'utf8')<=1024);
 }
 assert.match(drfxReviewWidgetHtml(),/s\.publishEnabled!==true/);
});

test('automatic widgets are off by default and retain legacy fallback',()=>{
 assert.match(source,/DRFX_WIDGET_AUTOSEND_ENABLED==='true'/);
 assert.match(source,/!attempted&&current\?\.status==='review'/);
 assert.match(source,/widgetSent=true/);
 assert.match(source,/if\(!widgetSent\)/);
 assert.match(source,/reply_markup:\{inline_keyboard:kb\}/);
});

test('widget callback accepts data queries with optional type and sends safe Mini App fallback',()=>{
 assert.match(source,/q\.type!=null&&q\.type\?\.type!=='data'/);
 assert.match(source,/async function drfxSendReviewWidget/);
 assert.match(source,/await tg\(env,'sendWidget',payload\)/);
 assert.match(source,/allow_queries:true,protect_content:true/);
 assert.match(source,/chat_data:drfxReviewChatData\(item/);
 assert.match(source,/web_app:\{url:appUrl\}/);
 assert.match(source,/Manual widget unavailable; using admin Mini App fallback/);
 assert.match(source,/setChatMenuButton/);
 assert.doesNotMatch(source,/setMenuButton/);
});

test('production widget commands are registered and webhook is self healing',()=>{
 assert.match(source,/command:'review'/);
 assert.match(source,/command:'widgets'/);
 assert.match(source,/getWebhookInfo/);
 assert.match(source,/info\.allowed_updates\.includes\('widget_query'\)/);
 assert.match(source,/drfx-v0\.6-widget-interaction-fix/);
});


test('admin action stays usable while publication is deliberately disabled',()=>{
 const html=drfxReviewWidgetHtml();
 assert.match(html,/txt\('approve',s\.quickReady===true&&s\.publishEnabled===true/);
 assert.match(html,/openAdmin\(\);return/);
 assert.match(html,/act\('status'\)/);
 assert.match(source,/command:'widgetstatus'/);
 assert.match(source,/async function drfxWidgetOneTimeProbe/);
 assert.match(source,/status:'demo'/);
 assert.match(source,/widget_probe_release/);
});

test('Telegram private photo widget embeds only compact data JPEGs and safely falls back',()=>{
 const html=drfxReviewWidgetHtml();
 assert.match(html,/id="photoPreview"/);
 assert.match(source,/async function drfxBuildReviewWidgetHtml/);
 assert.match(source,/data:image\/jpeg;base64,/);
 assert.match(source,/new CompressionStream\('deflate'\)/);
 assert.match(source,/compressed.byteLength>4096/);
 assert.match(source,/new TextEncoder\(\)\.encode\(html\)\.length>32768/);
 assert.match(source,/await tg\(env,'sendPhoto',\{chat_id:chatId,photo:item.file_id/);
 assert.match(source,/await drfxBuildReviewWidgetHtml\(env,item\)/);
 assert.ok(Buffer.byteLength(html,'utf8')<=32768);
 assert.ok(deflateSync(Buffer.from(html),{level:9}).byteLength<=4096);
});

test('widget fast publication is enabled only for owner-reviewed content',()=>{
 const text=JSON.parse(drfxReviewChatData({id:22,status:'review',draft_text:'XAUUSD BUY SL 10',file_id:null},true));
 const unapproved=JSON.parse(drfxReviewChatData({id:23,status:'review',file_id:'photo'},true));
 const approved=JSON.parse(drfxReviewChatData({id:23,status:'review',file_id:'photo'},true,true));
 assert.equal(text.quickReady,true);
 assert.equal(unapproved.quickReady,false);
 assert.equal(approved.quickReady,true);
 assert.match(source,/scan_status!=='approved'/);
 assert.match(source,/new Uint8Array\(await brandPhoto/);
 assert.match(source,/await publishRow\(env,row,currentSettings,false,cleaned\)/);
 assert.match(source,/quick-publish'&&method==='POST'/);
 assert.match(source,/if\(configuration.emergencyStop\)/);
});

test('compact photo widget has interactive controls and leaves room for JPEG bytes',()=>{
 const html=drfxPhotoReviewWidgetHtml();
 assert.match(html,/id="photoPreview"/);
 assert.ok(Buffer.byteLength(html,'utf8')<=32768);
 assert.ok(deflateSync(Buffer.from(html),{level:9}).byteLength<=2400,
 'photo renderer should reserve at least 1.6KB for a JPEG thumbnail');
 assert.match(html,/TelegramWidget/);
 assert.match(html,/drfx:/);
 assert.doesNotMatch(html,/<img[^>]*src="https?:/);
});
