"""Build a source-only pendrive ZIP; exclude machine secrets and dependencies."""
from pathlib import Path
import hashlib
import json
import zipfile
root = Path(__file__).resolve().parents[1]
out = root / 'release'
out.mkdir(exist_ok=True)
archive = out / 'Fais-College.zip'
blocked = {'node_modules', '.git', '.build', 'release', 'test-results', 'playwright-report', '__pycache__', '.agents', '.codex'}
files = []
for entry in root.rglob('*'):
    rel = entry.relative_to(root)
    if any(part in blocked for part in rel.parts):
        continue
    if not entry.is_file() or entry.is_symlink():
        continue
    if entry.name in {'.DS_Store', '.fais-node-path'} or (entry.name.startswith('.env') and entry.name != '.env.example'):
        continue
    if rel.parts[:2] == ('frontend', 'dist'):
        continue
    files.append((entry, rel.as_posix()))
manifest = {name: hashlib.sha256(entry.read_bytes()).hexdigest() for entry, name in sorted(files)}
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for entry, name in sorted(files):
        z.write(entry, 'Fais/' + name)
    z.writestr('Fais/archive-manifest.json', json.dumps(manifest, indent=2) + '\n')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert 'Fais/backend/.env' not in z.namelist()
    assert 'Fais/backend/.env.example' in z.namelist()
checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
(out / 'Fais-College.zip.sha256').write_text(checksum + '  Fais-College.zip\n')
print(f'{archive}: {len(files)} files, {archive.stat().st_size / 1024 / 1024:.1f} MB; ZIP integrity passed')
