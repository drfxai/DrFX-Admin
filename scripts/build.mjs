import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const resolve = p => path.join(root, p);
const files = [
  ['/index.html', 'text/html; charset=utf-8', 'web/index.html', false],
  ['/app.js', 'text/javascript; charset=utf-8', 'web/app.js', false],
  ['/fast-pro.css', 'text/css; charset=utf-8', 'web/fast-pro.css', false],
  ['/fast-pro.js', 'text/javascript; charset=utf-8', 'web/fast-pro.js', false],
  ['/assets/card-base.jpg', 'image/jpeg', 'web/assets/card-base.jpg', true],
  ['/assets/demo-chart.jpg', 'image/jpeg', 'web/assets/demo-chart.jpg', true],
];
const manifest = {};
for (const [url, type, filename, binary] of files) {
  const bytes = await readFile(resolve(filename));
  manifest[url] = binary
    ? { type, base64: bytes.toString('base64') }
    : { type, text: bytes.toString('utf8') };
}
const identity = (await readFile(resolve('src/identity-intel.mjs'), 'utf8')).replace(/^export /gm, '');
const runtime = identity + '\n' + await readFile(resolve('src/worker-runtime.mjs'), 'utf8');
const output = '// DrFX Admin v0.2 Worker single-module deploy, generated from source files\n'
  + 'const __drfxStatic = ' + JSON.stringify(manifest) + ';\n' + runtime;
if (process.argv.includes('--check')) {
  const deployedSnapshot = await readFile(resolve('dist/worker.mjs'), 'utf8');
  if (deployedSnapshot !== output) {
    console.error('Bundle mismatch: run npm run build and review before committing.');
    process.exitCode = 1;
  } else {
    console.log('Bundle matches committed Worker bundle.');
  }
} else {
  await mkdir(resolve('dist'), { recursive: true });
  await writeFile(resolve('dist/worker.mjs'), output);
  console.log('Built dist/worker.mjs (' + Buffer.byteLength(output) + ' bytes)');
}
