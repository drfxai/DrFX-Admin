import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('web/index.html'),js=read('web/app.js'),css=read('web/luxury.css');
test('three destination navigation remains minimal',()=>{
 const nav=[...html.matchAll(/<nav class="(?:bottomnav|nav)"[^>]*>([\s\S]*?)<\/nav>/g)];
 assert.equal(nav.length,2);
 for(const match of nav)assert.deepEqual([...match[1].matchAll(/data-page="([^"]+)"/g)].map(x=>x[1]),['home','inbox','settings']);
});
test('home content card has safe actions and live-binding targets',()=>{
 const ids=['home','homeSymbol','homeSide','homeEntry','homeStop','homeTargets','homeSafety','homePublish','homeEdit','homePreview','homeOpenInbox'];
 for(const id of ids)assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(js,/function renderHome\(\)/);
 assert.match(js,/function homeCanPublish\(x\)/);
 assert.match(js,/await mutation\('publish'\)/);
});
test('Fast and Pro remain distinct modes inside Inbox',()=>{
 assert.match(js,/inboxMode='fast'/);
 assert.match(js,/input==='inbox'\?inboxMode/);
 assert.match(js,/el\('workbench'\)\.style\.display=name==='pro'/);
 assert.match(html,/id="fastQueue"/);
 assert.match(html,/id="workbench"/);
});
test('Pro editing and media IDs stay available after controls are folded',()=>{
 const ids=['photoPreview','cleanBox','visualOverlay','scanImageBtn','approveImageBtn','draftEdit','tabEdit','publishBtn','saveDraft','ocrBtn','regenBtn','deleteBtn','rejectBtn','smartTools','identityAudit','recoveryPanel'];
 for(const id of ids)assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(html,/id="aiToolsDetails"/);
 assert.match(html,/class="assistant-action-more"/);
});
test('Settings keep essential controls and hide advanced settings behind details',()=>{
 const ids=['brandName','website','handle','saveSettings','watermarkToggle','autoPublishToggle','emergencyStopToggle','cardModeToggle','duplicateGuardToggle','strictValidationToggle','scanDepth','identityGuardToggle'];
 for(const id of ids)assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(html,/<details class="assistant-settings-extra" id="advancedSettings">/);
});
test('CSS applies safe-area and reduced-motion',()=>{
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(css,/env\(safe-area-inset-bottom\)/);
 assert.match(css,/prefers-reduced-motion/);
});

test('Home offers fast publish and explicit automatic publishing preference',()=>{
 for(const id of ['homeAutoPublish','homeAutoPublishLabel'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(html,/⚡ انتشار سریع/);
 assert.match(js,/el\('homeAutoPublish'\)\.addEventListener/);
 assert.match(js,/quick-publish/);
 assert.match(js,/imageData\.get\(x\.id\)\?\.scan_status==='approved'/);
});
