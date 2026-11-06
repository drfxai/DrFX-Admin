import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/worker-runtime.mjs', import.meta.url), 'utf8');
const from = source.indexOf('function toAscii(value){');
const to = source.indexOf('\nfunction removePromo', from);
assert.ok(from >= 0 && to > from, 'Parser must remain present in deployed runtime');
const parseSignal = vm.runInNewContext(source.slice(from, to) + '\nparseSignal', {}, { timeout: 1000 });

const initial = [
  '🚀 GOLD SIGNAL | XAUUSD 🚀',
  '🟢 BUY NOW',
  '📊 Entry Zone: 4075 – 4079',
  '🎯 TAKE PROFIT LEVELS',
  '✅ TP1: 4085',
  '✅ TP2: 4090',
  '✅ TP3: 4100',
  '🛑 STOP LOSS: 4065',
  '⚖️ Risk / Reward: 1:2 (Target)'
].join('\n');

test('accepts the reported gold signal and preserves its ranged entry', () => {
  const x = parseSignal(initial);
  assert.ok(x);
  assert.equal(x.side, 'BUY');
  assert.equal(x.symbol, 'XAUUSD');
  assert.equal(x.entry, 4077);
  assert.equal(x.entryLow, 4075);
  assert.equal(x.entryHigh, 4079);
  assert.equal(x.entryZone, '4075 - 4079');
  assert.equal(x.sl, 4065);
  assert.deepEqual(Array.from(x.tps), [4085,4090,4100]);
  assert.ok(Math.abs(x.rr - (23 / 12)) < 1e-9);
});
test('accepts single entry with short SL and TP', () => {
  const x = parseSignal('GOLD BUY NOW\nENTRY: 4077\nSL: 4065\nTP1: 4085');
  assert.ok(x);
  assert.equal(x.entry, 4077);
  assert.equal(x.entryZone, null);
});
test('accepts sell ranges and sorts reversed boundaries', () => {
  const x = parseSignal('XAUUSD SELL NOW\nEntry Zone: 4090 - 4086\nSL: 4100\nTP1: 4080\nTP2: 4070');
  assert.ok(x);
  assert.equal(x.entryLow, 4086);
  assert.equal(x.entryHigh, 4090);
  assert.equal(x.entry, 4088);
});
test('normalizes Persian and Arabic digits with Unicode dash', () => {
  const x = parseSignal('XAUUSD BUY\nEntry Zone: ۴۰۷۵ – ۴۰۷۹\nSL: ٤٠٦٥\nTP1: ۴۰۸۵');
  assert.ok(x);
  assert.equal(x.entry, 4077);
});
test('accepts unnumbered target list', () => {
  const x = parseSignal('XAUUSD BUY NOW\nEntry 4077\nSL 4065\nTP: 4085 4090 4100');
  assert.ok(x);
  assert.deepEqual(Array.from(x.tps), [4085,4090,4100]);
});
test('rejects missing stop loss', () => {
  assert.equal(parseSignal('XAUUSD BUY NOW\nENTRY 4077\nTP1 4085'), null);
});
test('rejects missing targets', () => {
  assert.equal(parseSignal('XAUUSD BUY NOW\nENTRY 4077\nSL 4065'), null);
});
test('rejects buy stop loss inside entry zone', () => {
  assert.equal(parseSignal('XAUUSD BUY NOW\nEntry Zone 4075-4079\nSL 4078\nTP1 4085'), null);
});
test('rejects buy target inside entry zone', () => {
  assert.equal(parseSignal('XAUUSD BUY NOW\nEntry Zone 4075-4079\nSL 4065\nTP1 4078'), null);
});
test('rejects sell target inside entry zone', () => {
  assert.equal(parseSignal('XAUUSD SELL NOW\nEntry Zone 4075-4079\nSL 4085\nTP1 4078'), null);
});
test('rejects conflicting trade directions', () => {
  assert.equal(parseSignal('XAUUSD BUY and SELL\nENTRY 4077\nSL 4065\nTP1 4085'), null);
});
test('rejects a signal without symbol', () => {
  assert.equal(parseSignal('BUY NOW\nENTRY 4077\nSL 4065\nTP1 4085'), null);
});
