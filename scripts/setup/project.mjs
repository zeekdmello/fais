import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import readline from 'node:readline/promises';
const root = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(root);
const required = ['package.json', 'package-lock.json', 'frontend/package.json', 'frontend/src/App.jsx', 'backend/package.json', 'backend/src/server.js', 'backend/.env.example'];
for (const file of required) if (!fs.existsSync(file)) throw Error(`Missing ${file}. Extract the entire ZIP first.`);
if (fs.existsSync('archive-manifest.json')) {
  const manifest = JSON.parse(fs.readFileSync('archive-manifest.json', 'utf8'));
  for (const file of Object.keys(manifest)) {
    if (!fs.existsSync(file)) throw Error(`Missing archive file ${file}. Extract the entire ZIP again.`);
  }
  console.log(`Archive completeness: ${Object.keys(manifest).length} files present.`);
}
const [major, minor] = process.versions.node.split('.').map(Number);
if (major !== 24 || minor < 14) throw Error('Use Node 24.14 or newer 24.x; reopen your terminal after installation.');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(args) {
  const result = spawnSync(npm, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) throw Error(`npm ${args.join(' ')} failed. Check internet/permissions and rerun setup.`);
}
console.log(`Node ${process.version}. Installing locked React, Express, Mongoose and other dependencies…`);
run(['ci']);
if (!fs.existsSync('backend/.env')) {
  fs.writeFileSync('backend/.env', fs.readFileSync('backend/.env.example', 'utf8').replace('replace-with-at-least-32-random-characters', crypto.randomBytes(32).toString('hex')), { mode: 0o600 });
}
process.loadEnvFile('backend/.env');
const require = createRequire(path.join(root, 'backend/package.json'));
const mongoose = require('mongoose');
console.log('Checking MongoDB connection (credentials are not printed)…');
let ready = false;
for (let attempt = 0; attempt < 6; attempt++) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    await mongoose.connection.db.admin().ping(); ready = true; break;
  } catch { await mongoose.disconnect(); await new Promise(resolve => setTimeout(resolve, 2000)); }
}
await mongoose.disconnect();
if (!ready) throw Error('MongoDB did not answer. See database troubleshooting in SETUP-COLLEGE.md. Existing backend/.env was preserved.');
console.log('MongoDB ping passed.');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
try {
  if ((await rl.question('Add the demo account and sample data? [Y/n] ')).toLowerCase() !== 'n') run(['run', 'seed']);
  run(['run', 'build']);
  const nodePath = process.execPath;
  // Store the selected runtime for launchers; no system PATH changes are required.
  fs.writeFileSync('.fais-node-path', nodePath);
  console.log('\nSetup complete. Open http://127.0.0.1:4000 after starting. Compass: mongodb://127.0.0.1:27017 (database fais).');
  if ((await rl.question('Start Fais now? [Y/n] ')).toLowerCase() !== 'n') run(['start']);
} finally { rl.close(); }
