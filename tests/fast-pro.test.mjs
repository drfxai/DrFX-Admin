import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Fast and Pro views have actionable DOM targets',()=>{
 const h=read('web/index.html');
 const ids=['fastQueue','fastReadyNumber','fastPendingCount','fastImageCount','fastRefresh','identityAudit','identityAuditList','identityGuardToggle','scanDepth','workbench','publicationResult'];
 for(const id of ids)assert.ok(h.includes('id="'+id+'"'),id);
 assert.match(h,/data-page="fast"/);
 assert.match(h,/data-page="pro"/);
});
test('UI workspaces are linked and use the safe publication controller',()=>{
 const fast=read('web/fast-pro.js'),client=read('web/app.js');
 assert.match(fast,/data-fx="publish"/);
 assert.match(client,/await quickPublish\(id\)/);
 assert.match(client,/fastMode\.init\(\)/);
 assert.match(client,/scanDepth:el\('scanDepth'\)\.value/);
});
test('Worker uses identity guard and manual image approval',()=>{
 const worker=read('src/worker-runtime.mjs');
 assert.match(worker,/identityGuard!==false/);
 assert.match(worker,/detectIdentifiers\(outgoing/);
 assert.match(worker,/scanDepth==='deep'/);
 assert.match(worker,/scan_status!=='approved'/);
 assert.match(worker,/status='sending'/);
});
