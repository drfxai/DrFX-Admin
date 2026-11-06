import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/worker-runtime.mjs',import.meta.url),'utf8');
const start=source.indexOf('function removePromo(');
const end=source.indexOf('\nconst coder=',start);
assert.ok(start>=0&&end>start,'Channel formatter should exist');
const formatChannelPost=vm.runInNewContext(source.slice(start,end)+'\nformatChannelPost',{}, {timeout:1000});
const body="⚠️ STOP LOSS HIT\n\nDon't worry, guys. Losses are a normal part of trading.\n\nStay calm, manage your risk, and wait for the next opportunity. 📈";
const expected=body+'\n\n📲 https://drfx.company\n\n@DrFXAi';
test('formats the exact Telegram stop-loss example',()=>{assert.equal(formatChannelPost(body),expected);});
test('existing correct footer is not duplicated',()=>{assert.equal(formatChannelPost(expected),expected);});
test('old footer disappears while paragraphs remain',()=>{
 const previous=body+'\n\n—\nDR FX AI\nhttps://drfx.company\n@DrFXAi';
 assert.equal(formatChannelPost(previous),expected);
});
test('original gold-signal levels are unchanged',()=>{
 const signal='🚀 GOLD SIGNAL | XAUUSD 🚀\n\n🟢 BUY NOW\n\n📊 Entry Zone: 4075 – 4079\n🎯 TAKE PROFIT LEVELS\n✅ TP1: 4085\n✅ TP2: 4090\n✅ TP3: 4100\n🛑 STOP LOSS: 4065';
 assert.equal(formatChannelPost(signal),signal+'\n\n📲 https://drfx.company\n\n@DrFXAi');
});
test('third-party promotional links and handles are removed',()=>{
 const extra=body+'\n\nhttps://example.com\n@AnotherChannel';
 assert.equal(formatChannelPost(extra),expected);
});
