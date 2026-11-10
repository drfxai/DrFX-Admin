import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('web/index.html'),js=read('web/app.js'),fast=read('web/fast-pro.js'),css=read('web/polish.css');
test('four Pro workflow stages exist and are accessible by tab',()=>{
 const labels=[...html.matchAll(/data-pro-tab="(content|media|identity|publish)"/g)].map(m=>m[1]);
 assert.deepEqual(labels,['content','media','identity','publish']);
 assert.match(js,/function setProPanel\(panel,/);
 assert.match(js,/hasUnsavedDraft\(\)/);
 assert.match(js,/setAttribute\('aria-selected'/);
});
test('Pro panel controls preserve unique IDs and original image actions',()=>{
 const ids=['proToggleQueue','proSelectedSummary','proWorkspaceTabs','proPanelHint','proMediaPlaceholder','proPublishSummary','proScanShortcut','proRegenerateShortcut','proImageFineTune','cleanBox','visualWorkspace','visualOverlay','scanImageBtn','saveImageBtn','approveImageBtn','ocrBtn','saveDraft','publishBtn','recoveryPanel'];
 for(const id of ids)assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(js,/proQueueOpen/);
 assert.match(js,/el\('proToggleQueue'\)\.addEventListener/);
 assert.match(js,/el\('proScanShortcut'\)\.addEventListener/);
});
test('Home has genuine data fields and no fabricated candlestick chart',()=>{
 for(const id of ['homeArtSymbol','homeArtType','homeSymbol','homeSide','homeEntry','homeStop','homeTargets','homePublish'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.doesNotMatch(html,/id="chartGold"/);
 assert.doesNotMatch(html,/class="assistant-candles"/);
 assert.match(js,/publish\.dataset\.action=can\?'publish'/);
 assert.match(js,/x\.has_photo\?'media'/);
 assert.match(js,/x\?\.status==='failed'\?'recover'/);
});
test('fast queue routes photos to media review, not direct publish',()=>{
 assert.match(fast,/x\.has_photo\?'media'/);
 assert.match(fast,/Boolean\(x\.has_photo/);
 assert.match(fast,/await publish\(id\)/);
});
test('Settings separates publishing rules from AI and protection',()=>{
 const ids=['advancedSettings','publishingRules','intelligenceSettings','duplicateGuardToggle','strictValidationToggle','identityGuardToggle','scanDepth','autoPublishToggle','emergencyStopToggle'];
 for(const id of ids)assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
});
test('mobile Pro editor hides queue by default and has sticky safe actions',()=>{
 assert.match(css,/#workbench \.assistant-pro-queue-panel\{display:none\}/);
 assert.match(css,/#workbench\.pro-queue-open \.assistant-pro-queue-panel\{display:block\}/);
 assert.match(css,/bottom:calc\(76px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/\[data-pro-panel="media"\]/);
 assert.match(css,/\[data-pro-panel="publish"\]/);
});
test('visible navigation remains three destinations',()=>{
 for(const match of html.matchAll(/<nav class="(?:bottomnav|nav)"[^>]*>([\s\S]*?)<\/nav>/g))assert.deepEqual([...match[1].matchAll(/data-page="([^"]+)"/g)].map(m=>m[1]),['home','inbox','settings']);
});
test('HTML body has balanced non-void tags for Pro editor and Settings',()=>{
 const body=html.slice(html.indexOf('<body>'),html.indexOf('</body>')+7);
 const voids=new Set(['meta','link','input','img','br','hr','path','stop','rect','line','circle','polyline','polygon','ellipse']);
 const stack=[];
 for(const m of body.matchAll(/<(\/?)([A-Za-z][\w:-]*)\b[^>]*?>/g)){
  const tag=m[2].toLowerCase();
  if(voids.has(tag)||m[0].endsWith('/>'))continue;
  if(m[1])assert.equal(stack.pop(),tag,'misnested '+tag+' at '+m.index);
  else stack.push(tag);
 }
 assert.deepEqual(stack,[]);
});

test('Home prioritizes sent and failed delivery state over photo review',()=>{
 assert.match(js,/publish\.dataset\.action=can\?'publish':x\?\.status==='failed'\?'recover':x\?\.status==='sent'\?'result':x\?\.has_photo\?'media'/);
 assert.match(js,/showHomeItem\(false,item\.has_photo\?'media'/);
});
