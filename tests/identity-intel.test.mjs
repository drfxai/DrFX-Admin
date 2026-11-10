import test from 'node:test';
import assert from 'node:assert/strict';
import {detectIdentifiers,cleanExternalIdentifiers} from '../src/identity-intel.mjs';
const own={website:'https://drfx.company',handle:'@DrFXAi'};
test('detects handles, social links, emails, phone and ordinary websites',()=>{
 const text='XAUUSD BUY 4075 SL 4065 TP1 4085\n@ForexSignal https://t.me/gold_signals instagram.com/forexdesk hello@broker.com +971 501 234 567\nwww.badexample.net';
 const ids=detectIdentifiers(text,own);
 for(const needle of ['@ForexSignal','t.me/gold_signals','instagram.com/forexdesk','hello@broker.com','badexample.net'])assert.ok(ids.some(x=>x.value.includes(needle)),needle);
 assert.ok(ids.some(x=>x.type==='phone'));
 assert.ok(ids.every(x=>!['4075','4065','4085'].includes(x.value)));
});
test('recognizes own channel and site',()=>{
 const ids=detectIdentifiers('@DrFXAi https://drfx.company @FakeFX https://t.me/otherchannel',own);
 assert.equal(ids.length,4);
 assert.equal(ids.filter(x=>x.own).length,2);
});
test('cleans external identifiers but leaves entry, SL and TP values intact',()=>{
 const raw='XAUUSD BUY NOW\nENTRY: 4075 – 4079\nSL: 4065\nTP1: 4085\n@BadSignals\nhttps://t.me/badsignals\nhttps://drfx.company\n@DrFXAi';
 const text=cleanExternalIdentifiers(raw,own);
 assert.ok(!text.includes('@BadSignals')&&!text.includes('badsignals'));
 for(const needle of ['4075 – 4079','SL: 4065','TP1: 4085','drfx.company','@DrFXAi'])assert.ok(text.includes(needle),needle);
});
test('deduplicates matches overlapping email names',()=>{
 const ids=detectIdentifiers('contact hello@broker.com or hello@broker.com',own);
 assert.equal(ids.length,2);
 assert.ok(ids.every(x=>x.type==='email'));
});
