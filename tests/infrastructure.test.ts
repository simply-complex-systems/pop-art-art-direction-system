import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { normalizeBasePath } from '../scripts/base-path.js';
import { validatePacks } from '../scripts/pack-validation.js';
import { readAppearance, saveAppearance, APPEARANCE_STORAGE_KEY } from '../src/app/appearance.js';
import type { PackManifest } from '../src/state/types.js';
import { fixture } from './helpers.js';

test('Pages base path supports root and normalized repository subpaths', () => {
  assert.equal(normalizeBasePath('/'), '/');
  assert.equal(normalizeBasePath('repository-name'), '/repository-name/');
  assert.equal(normalizeBasePath('/repository-name/'), '/repository-name/');
  assert.equal(normalizeBasePath('nested/site'), '/nested/site/');
  for (const input of ['', '..', '/a/../b/', 'https://example.org/', '/a?b/', '/a\\b/'])
    assert.throws(() => normalizeBasePath(input), /VITE_BASE_PATH/);
});
test('appearance persistence is UI-only, validates values and tolerates unavailable storage', () => {
  const values = new Map<string, string>([['unrelated-project', 'unchanged']]);
  const storage = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.equal(readAppearance(storage), 'light');
  saveAppearance(storage, 'dark'); assert.equal(readAppearance(storage), 'dark');
  assert.equal(values.get('unrelated-project'), 'unchanged');
  storage.setItem(APPEARANCE_STORAGE_KEY, 'invalid'); assert.equal(readAppearance(storage), 'light');
  const blocked = { getItem: () => { throw new Error('Unavailable'); }, setItem: () => { throw new Error('Unavailable'); } };
  assert.equal(readAppearance(blocked), 'light'); assert.doesNotThrow(() => saveAppearance(blocked, 'dark'));
  assert.equal(readAppearance(undefined), 'light'); assert.doesNotThrow(() => saveAppearance(undefined, 'light'));
});
test('pack validation checks fixtures plus installed manifests and fails malformed or misclassified packs', () => {
  const root = mkdtempSync(join(tmpdir(), 'pop-art-validation-'));
  try {
    cpSync('schemas', join(root, 'schemas'), { recursive: true });
    mkdirSync(join(root, 'tests/fixtures'), { recursive: true });
    cpSync('tests/fixtures/pack.valid.json', join(root, 'tests/fixtures/pack.valid.json'));
    mkdirSync(join(root, 'packs/official/sample'), { recursive: true });
    mkdirSync(join(root, 'packs/community'), { recursive: true });
    let results = validatePacks(root);
    assert.equal(results.length, 1); assert.ok(results.every(r => r.valid));
    const pack = fixture<PackManifest>('pack.valid');
    pack.provenance = 'official';
    const target = join(root, 'packs/official/sample/manifest.json');
    writeFileSync(target, JSON.stringify(pack));
    results = validatePacks(root); assert.equal(results.length, 2); assert.ok(results.every(r => r.valid));
    pack.schemaVersion = '0.1-draft' as '1.0'; writeFileSync(target, JSON.stringify(pack));
    assert.ok(validatePacks(root).some(r => !r.valid && r.error?.includes('schemaVersion')));
    pack.schemaVersion = '1.0'; pack.provenance = 'community'; writeFileSync(target, JSON.stringify(pack));
    assert.ok(validatePacks(root).some(r => !r.valid && r.error?.includes('Expected official provenance')));
    writeFileSync(target, '{malformed'); assert.ok(validatePacks(root).some(r => !r.valid));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
