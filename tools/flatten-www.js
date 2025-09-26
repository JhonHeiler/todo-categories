// Move contents of www/browser/* up one level into www/ then delete www/browser
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function copyRecursive(src, dst) {
  const st = await fsp.stat(src);
  if (st.isDirectory()) {
    if (!fs.existsSync(dst)) await fsp.mkdir(dst, { recursive: true });
    for (const name of await fsp.readdir(src)) {
      await copyRecursive(path.join(src, name), path.join(dst, name));
    }
  } else {
    await fsp.copyFile(src, dst);
  }
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const www = path.join(root, 'www');
  const browser = path.join(www, 'browser');
  if (!fs.existsSync(browser)) {
    console.log('[flatten-www] Nothing to do (no www/browser directory)');
    return;
  }
  console.log('[flatten-www] Flattening www/browser into www ...');
  await copyRecursive(browser, www);
  await fsp.rm(browser, { recursive: true, force: true });
  console.log('[flatten-www] Done');
}

main().catch(e => { console.error('[flatten-www] Error', e); process.exit(1); });
