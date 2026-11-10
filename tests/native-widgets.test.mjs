import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {drfxReviewWidgetHtml,drfxReviewChatData} from '../src/worker-runtime.mjs';

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
