import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import type {AnySchema} from 'ajv';
import {loadLibrary} from '../src/pack-loader/registry.js';
export function hashFile(path: string): string {return createHash('sha256').update(readFileSync(path)).digest('hex');}
export async function auditOfficialLibrary(root: string) {
  if (!existsSync(resolve(root, 'packs/official-library.json'))) return undefined;
  const directory = resolve(root, 'packs');
  const schemas = Object.fromEntries(readdirSync(resolve(root, 'schemas')).filter(p => p.endsWith('.schema.json'))
    .map(p => [p, JSON.parse(readFileSync(resolve(root, 'schemas', p), 'utf8')) as AnySchema]));
  const registry = await loadLibrary({baseUrl: pathToFileURL(directory + '/').href, source: 'curated_registry', schemas,
    readJson: async url => JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as unknown});
  const ledger = registry.ledger;
  if (hashFile(resolve(directory, ledger.sourceInventoryPath)) !== ledger.sourceInventorySha256) throw new Error('Source inventory hash mismatch');
  const inventory = readFileSync(resolve(directory, ledger.sourceInventoryPath), 'utf8').trim().split(/\r?\n/).slice(1).map(line => {
    const match = /^(.+),([a-f0-9]{64}),(\d+)$/.exec(line);
    if (!match) throw new Error('Unsupported inventory row');
    return {path: match[1]!, sha256: match[2]!, bytes: Number(match[3])};
  });
  if (new Set(ledger.assets.map(a => a.sourcePath)).size !== ledger.assets.length) throw new Error('Duplicate source mapping');
  for (const asset of [...ledger.assets, ...ledger.derivatives]) {
    const path = fileURLToPath(registry.assetUrl(asset.path));
    if (hashFile(path) !== asset.sha256 || readFileSync(path).length !== asset.bytes) throw new Error(`Asset integrity mismatch: ${relative(root, path)}`);
    if (asset.inventoryVerified) {
      const row = inventory.find(i => i.path === asset.sourcePath);
      if (!row || row.sha256 !== asset.sha256 || row.bytes !== asset.bytes || asset.kind !== 'source-original') throw new Error('Inventory claim mismatch');
    }
  }
  for (const row of inventory) if (!ledger.assets.some(a => a.sourcePath === row.path && a.inventoryVerified)) throw new Error(`Missing source inventory entry: ${row.path}`);
  if (ledger.assets.some(a => !a.inventoryVerified && a.sourcePath !== 'ASSET_INVENTORY.csv')) throw new Error('Unverified source original');
  const recordIds = ledger.records.map(r => r.packId);
  if (new Set(recordIds).size !== registry.packs.size) throw new Error('Duplicate normalization ledger pack');
  for (const category of registry.catalog.categories) {
    const record = ledger.records.find(r => r.packId === category.packId);
    if (!record || record.normalizedPath !== category.manifestPath) throw new Error('Catalog ledger mismatch');
    if (hashFile(fileURLToPath(registry.assetUrl(category.manifestPath))) !== category.manifestSha256) throw new Error('Normalized manifest hash mismatch');
    if (hashFile(fileURLToPath(registry.assetUrl(record.historicalPath))) !== record.sourceSha256) throw new Error('Historical manifest hash mismatch');
    const original = JSON.parse(readFileSync(fileURLToPath(registry.assetUrl(record.historicalPath)), 'utf8')) as {pack_id: string; options: {id: string}[]; exemplars: {id:string}[]; documents: string[]};
    const pack = registry.packs.get(category.packId)!;
    if (original.pack_id !== pack.packId || JSON.stringify(original.exemplars.map(e => e.id)) !== JSON.stringify(pack.exemplars.map(e => e.id))) throw new Error('Stable source IDs changed');
    for (const id of original.options.map(o => o.id)) if (!pack.options.some(o => o.id === id)) throw new Error(`Lost source option: ${id}`);
    for (const [values, mappings] of [[pack.options,record.options],[pack.presets,record.presets],[pack.exemplars,record.exemplars],[pack.documents,record.documents]] as const) {
      if (values.length !== mappings.length || values.some(v => !mappings.some(m => m.normalizedId === v.id))) throw new Error('Record mapping coverage mismatch');
    }
  }
  return {registry, inventoryEntries: inventory.length, sourceMappings: ledger.assets.length,
    uniqueOriginals: new Set(ledger.assets.map(a => a.path)).size, derivatives: ledger.derivatives.length};
}
