import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(root);
let failed = false;
function check(name, ok) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed = true; }
check('Node 24.14+ in the 24.x line', /^24\./.test(process.versions.node) && Number(process.versions.node.split('.')[1]) >= 14);
check('Backend configuration', fs.existsSync('backend/.env'));
check('Built frontend', fs.existsSync('frontend/dist/index.html'));
let mongoose;
try {
  const require = createRequire(path.join(root, 'backend/package.json'));
  mongoose = require('mongoose');
  check('Installed application dependencies', true);
  process.loadEnvFile('backend/.env');
  check('Session secret configured', (process.env.SESSION_SECRET || '').length >= 32 && !process.env.SESSION_SECRET.includes('replace-with'));
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.db.admin().ping();
  check('MongoDB ping', true);
} catch { check('Dependencies/configuration/MongoDB connection (see SETUP-COLLEGE.md)', false); }
finally { if (mongoose) await mongoose.disconnect(); }
console.log(failed ? 'Fix the FAIL items before presenting.' : 'Ready. Run npm start and open http://127.0.0.1:4000.');
process.exitCode = failed ? 1 : 0;
