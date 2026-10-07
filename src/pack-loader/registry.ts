import type { AnySchema } from 'ajv';
import { Ajv } from 'ajv';
import { classifyPack } from '../state/provenance.js';
import { createContractValidator } from '../state/schema-validation.js';
import type { PackManifest, PackOption, PackExemplar, Preset, PackAssetReference } from '../state/types.js';
import type { OfficialCatalog, NormalizationLedger, LibraryRegistry, Registered, SourceAssetRecord } from './types.js';

/** Library paths are rooted at the static library, never at a current page or a manifest directory. */
export function libraryUrl(baseUrl: string, path: string): string {
  if (!path || /[\\?#%]/.test(path) || path.startsWith('/') || path.split('/').some(p => !p || p === '.' || p === '..')
    || /^[a-z][a-z\d+.-]*:/i.test(path)) throw new Error(`Unsafe library path: ${path}`);
  const base = new URL(baseUrl);
  if (!['http:', 'https:', 'file:'].includes(base.protocol) || !base.pathname.endsWith('/')) throw new Error('Library base must be an absolute directory URL');
  return new URL(path, base).href;
}
export function assertAssetIdentity(asset: SourceAssetRecord): void {
  if (asset.kind === 'source-original' && asset.derivedFrom !== null) throw new Error('Derivative cannot masquerade as source original');
  if (asset.kind === 'derivative' && (!asset.derivedFrom || asset.path === asset.derivedFrom)) throw new Error('Derivative needs a distinct source/path');
}
export interface LoadLibraryOptions {
  baseUrl: string; readJson: (url: string) => Promise<unknown>; schemas: Record<string, AnySchema>;
  /** This trust decision belongs to the caller's installed registry, never to JSON content. */
  source: 'curated_registry' | 'community_import';
}
export async function loadLibrary({baseUrl, readJson, schemas, source}: LoadLibraryOptions): Promise<LibraryRegistry> {
  const ajv = new Ajv({strict: true, allErrors: true});
  Object.values(schemas).forEach(s => ajv.addSchema(s));
  function validate(name: string, value: unknown) {
    const fn = ajv.getSchema(`https://pop-art.local/schemas/${name}.schema.json`);
    if (!fn || !fn(value)) throw new Error(`${name}: ${fn ? ajv.errorsText(fn.errors) : 'schema missing'}`);
  }
  const rawCatalog = await readJson(libraryUrl(baseUrl, 'official-library.json'));
  validate('official-library', rawCatalog); const catalog = rawCatalog as OfficialCatalog;
  const rawLedger = await readJson(libraryUrl(baseUrl, catalog.ledgerPath));
  validate('normalization-ledger', rawLedger); const ledger = rawLedger as NormalizationLedger;
  [...ledger.assets, ...ledger.derivatives].forEach(a => {assertAssetIdentity(a); libraryUrl(baseUrl, a.path);});
  if (ledger.derivatives.some(d => d.kind !== 'derivative' || !ledger.assets.some(a => a.path === d.derivedFrom))
    || ledger.assets.some(a => a.kind !== 'source-original')) throw new Error('Derivative/source ledger classification mismatch');
  if (new Set(catalog.categories.map(c => c.number)).size !== catalog.categories.length) throw new Error('Duplicate catalog category number');
  const validateContract = createContractValidator(schemas);
  const packs = new Map<string, PackManifest>();
  const options = new Map<string, Registered<PackOption>>();
  const presets = new Map<string, Registered<Preset>>();
  const exemplars = new Map<string, Registered<PackExemplar>>();
  function put<T>(map: Map<string, Registered<T>>, key: string, pack: PackManifest, value: T) {
    if (map.has(key)) throw new Error(`Duplicate registry ID: ${key}`);
    map.set(key, {packId: pack.packId, provenance: pack.provenance, value});
  }
  const loaded = await Promise.all(catalog.categories.map(async entry => {
    const raw = await readJson(libraryUrl(baseUrl, entry.manifestPath)); validateContract('pack', raw);
    const pack = classifyPack(raw as PackManifest, source);
    if (pack.packId !== entry.packId || pack.packType !== entry.packType || pack.displayName !== entry.displayName) throw new Error('Catalog/manifest identity mismatch');
    if (JSON.stringify(pack.options.map(o => o.id)) !== JSON.stringify(entry.optionIds)
      || JSON.stringify(pack.presets.map(p => p.id)) !== JSON.stringify(entry.presetIds)) throw new Error('Catalog option/preset references mismatch');
    function checkAsset(a: PackAssetReference, thumbnail = false) {
      if ('path' in a) {
        libraryUrl(baseUrl, a.path);
        const candidates = thumbnail ? [...ledger.assets, ...ledger.derivatives] : ledger.assets;
        if (!candidates.some(r => r.path === a.path && r.sha256 === a.sha256 && (thumbnail || r.kind === 'source-original'))) throw new Error(`Untracked original asset: ${a.path}`);
      } else if ('sourceUrl' in a && new URL(a.sourceUrl).protocol !== 'https:') throw new Error('External references require HTTPS');
    }
    pack.documents.forEach(d => checkAsset(d.asset));
    pack.exemplars.forEach(e => {checkAsset(e.asset); if (e.thumbnail) checkAsset(e.thumbnail, true);});
    return pack;
  }));
  for (const pack of loaded) {
    if (packs.has(pack.packId)) throw new Error(`Duplicate pack ID: ${pack.packId}`); packs.set(pack.packId, pack);
    // Source option IDs are pack-local; composite keys preserve IDs without colliding across categories.
    pack.options.forEach(o => put(options, `${pack.packId}::${o.id}`, pack, o));
    pack.presets.forEach(p => put(presets, p.id, pack, p));
    pack.exemplars.forEach(e => put(exemplars, `${pack.packId}::${e.id}`, pack, e));
  }
  if (ledger.records.length !== packs.size || ledger.records.some(r => !packs.has(r.packId))) throw new Error('Normalization ledger coverage mismatch');
  return {catalog, ledger, packs, options, presets, exemplars,
    optionsFor: (id, axis) => (packs.get(id)?.options ?? []).filter(o => axis === undefined || o.axis === axis),
    assetUrl: path => libraryUrl(baseUrl, path)};
}
