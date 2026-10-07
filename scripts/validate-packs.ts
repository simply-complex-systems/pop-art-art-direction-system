import { relative } from 'node:path';
import { validatePacks } from './pack-validation.js';
import { auditOfficialLibrary } from './library-audit.js';
const root = process.cwd();
try {
  const results = validatePacks(root);
  for (const result of results) console.log(`${result.valid ? 'PASS' : 'FAIL'} ${relative(root, result.path)}${result.error ? `: ${result.error}` : ''}`);
  const official = results.filter(r => r.source === 'official').length;
  const community = results.filter(r => r.source === 'community').length;
  console.log(`Checked ${results.length} manifest(s): ${official} Official, ${community} Community, 1 contract fixture.`);
  if (!official) console.log('Official corpus ingestion is deferred to Phase 3; no Official packs are installed.');
  const audit = await auditOfficialLibrary(root);
  if (audit) console.log(`PASS Official catalog, references, ledger and SHA-256 audit: ${audit.inventoryEntries} inventory entries, ${audit.sourceMappings} source mappings, ${audit.uniqueOriginals} stored originals, ${audit.derivatives} derivatives.`);
  if (results.some(r => !r.valid)) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
