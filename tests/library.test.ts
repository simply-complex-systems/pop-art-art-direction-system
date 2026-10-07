import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import type {AnySchema} from 'ajv';
import {auditOfficialLibrary} from '../scripts/library-audit.js';
import {loadLibrary, libraryUrl, assertAssetIdentity} from '../src/pack-loader/registry.js';
import type {SourceAssetRecord} from '../src/pack-loader/types.js';
import {createProject} from '../src/state/defaults.js';
const schemas = Object.fromEntries(readdirSync('schemas').filter(p => p.endsWith('.schema.json'))
  .map(p => [p, JSON.parse(readFileSync('schemas/'+p, 'utf8')) as AnySchema]));
const baseUrl = pathToFileURL(resolve('packs')+'/').href;
const readJson = async (url:string):Promise<unknown> => JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as unknown;
const library = await loadLibrary({baseUrl, readJson, schemas, source:'curated_registry'});
const category = (n:number) => library.packs.get(library.catalog.categories.find(c => c.number === n)!.packId)!;
test('all 15 Official manifests, catalog IDs and required original references resolve', () => {
  assert.equal(library.packs.size,15); assert.equal(library.exemplars.size,15); assert.equal(library.presets.size,4); assert.equal(library.options.size,144);
  assert.deepEqual(library.catalog.categories.map(c=>c.number),Array.from({length:15},(_,i)=>i+1));
  for (const pack of library.packs.values()) {
    assert.equal(pack.provenance,'official');
    for (const ref of [...pack.exemplars.map(e=>e.asset),...pack.documents.map(d=>d.asset)]) {
      assert.ok('path' in ref); if ('path' in ref) assert.ok(readFileSync(fileURLToPath(library.assetUrl(ref.path))).length>0);
    }
  }
});
test('every supplied inventory original matches hash and size, and every manifest record is traceable', async () => {
  const audit=await auditOfficialLibrary(process.cwd()); assert.ok(audit); assert.equal(audit.inventoryEntries,71);
  assert.equal(audit.sourceMappings,72); assert.equal(audit.uniqueOriginals,71); assert.equal(audit.derivatives,0);
});
test('derivatives cannot masquerade as source originals or replace their path', () => {
  const a=structuredClone(library.ledger.assets[0]!) as SourceAssetRecord;
  assert.doesNotThrow(()=>assertAssetIdentity(a)); a.derivedFrom=a.path;
  assert.throws(()=>assertAssetIdentity(a),/masquerade/); a.kind='derivative';
  assert.throws(()=>assertAssetIdentity(a),/distinct/); a.path='derivatives/separate.png'; assert.doesNotThrow(()=>assertAssetIdentity(a));
});
test('provenance is imposed by installed source trust, including nested evidence and presets', async () => {
  for (const source of ['community_import','curated_registry'] as const) {
    const result=await loadLibrary({baseUrl,schemas,source,readJson:async url => {
      const value=await readJson(url);
      if(url.endsWith('/manifest.json')) {const p=value as {provenance:string;exemplars:{provenance:string}[];presets:{provenance:string}[]};p.provenance=source==='curated_registry'?'community':'official';p.exemplars.forEach(e=>e.provenance=p.provenance);p.presets.forEach(e=>e.provenance=p.provenance);}
      return value;
    }});
    const expected=source==='curated_registry'?'official':'community';
    for(const p of result.packs.values()) {assert.equal(p.provenance,expected);p.exemplars.forEach(e=>assert.equal(e.provenance,expected));p.presets.forEach(e=>assert.equal(e.provenance,expected));}
  }
});
test('Category 5 keeps independent field/texture/finish axes and technical distinctions', () => {
  const p=category(5);assert.equal(library.optionsFor(p.packId,'field').length,10);assert.equal(library.optionsFor(p.packId,'texture').length,7);assert.equal(library.optionsFor(p.packId,'finish').length,4);
  assert.equal(p.options.find(o=>o.id==='flat-field')?.axis,'texture');assert.equal(p.options.find(o=>o.id==='none')?.axis,'finish');
  for (const [id,term] of [['ben-day-dots','equal-size'],['halftone-gradient','varies'],['stipple','without a grid'],['crosshatch','intersecting'],['misregistration','black structure']]) assert.ok(JSON.stringify(p.options.find(o=>o.id===id)?.value).includes(term!));
});
test('Category 8 pose authority stays separate from Category 14 camera definitions', () => {
  assert.ok(category(8).doesNotGovern.some(s=>s.includes('Category 14')));
  assert.ok(category(14).compatibility.notes.some(s=>s.includes('Authoritative')));
  assert.ok(category(8).governs.some(s=>s.includes('pose')));
});
test('four named triads are optional presets, with provisional color targets; seven strategies add no approval claims', () => {
  const p=category(4); assert.equal(p.presets.length,4);assert.equal(p.colorStrategies.length,7);
  assert.ok(p.governs.every(s=>!s.includes('triad')));assert.ok(p.exemplars.every(e=>e.governs.every(s=>!s.includes('triad'))));
  assert.equal(library.catalog.colorSystem.defaultStrategy,'high_contrast_structured');
  assert.ok(library.catalog.colorSystem.strategies.every(s=>s.exemplarEvidence.length===0));
  assert.match(library.catalog.colorSystem.presetTargets,/provisional/);
  assert.ok(p.colorRoles.every(r=>!/(hair|dress|witch|woman|armor)/i.test(r.id)));
  assert.ok(category(9).options.some(o=>o.axis==='palette-mood'));assert.ok(category(9).options.some(o=>o.axis==='harmony-evidence'));
});
test('generic loader accepts renamed arbitrary content and a one-pack catalog; fresh projects remain unauthored', async () => {
  const first=library.catalog.categories[0]!;
  const result=await loadLibrary({baseUrl,schemas,source:'curated_registry',readJson:async url=>{
    const v=await readJson(url);
    if(url.endsWith('official-library.json')) {const c=v as typeof library.catalog;c.categories=[structuredClone(first)];c.categories[0]!.displayName='Generic subject evidence';}
    if(url.endsWith('normalization-ledger.json')) {const l=v as typeof library.ledger;l.records=l.records.filter(r=>r.packId===first.packId);}
    if(url.endsWith(first.manifestPath)) {const p=v as ReturnType<typeof category>;p.displayName='Generic subject evidence';p.description='Unrelated authored subject';}
    return v;
  }});
  assert.equal(result.packs.size,1);
  const p=createProject('generic','Untitled'); assert.equal(p.subject,null);assert.equal(p.theme,null);
});
test('base-aware references keep repository prefix; path traversal and external masquerading paths fail', () => {
  const base='https://example.org/repository-name/';
  for(const p of library.packs.values()) for(const d of p.documents) if('path' in d.asset) assert.ok(libraryUrl(base,d.asset.path).startsWith(base));
  for(const path of ['../outside.png','/outside.png','https://host/image.png','%2e%2e/asset','a\\b','a?query']) assert.throws(()=>libraryUrl(base,path),/Unsafe/);
});
test('malformed catalogs, ledger gaps, duplicate IDs and mismatched references fail loading', async () => {
  for (const alter of ['schema','ledger','duplicate','options']) await assert.rejects(loadLibrary({baseUrl,schemas,source:'curated_registry',readJson:async url=>{
    const v=await readJson(url);
    if(url.endsWith('official-library.json')) {const c=v as typeof library.catalog;if(alter==='schema')c.schemaVersion='bad' as '1.0';if(alter==='duplicate')c.categories.push(structuredClone(c.categories[0]!));if(alter==='options')c.categories[0]!.optionIds=[];}
    if(url.endsWith('normalization-ledger.json')&&alter==='ledger')(v as typeof library.ledger).records=[];
    return v;
  }}));
});
test('browser loader rejects an untracked original and a derivative disguised in the original ledger', async () => {
  for(const alteration of ['hash','derivative']) await assert.rejects(loadLibrary({baseUrl,schemas,source:'curated_registry',readJson:async url=>{
    const value=await readJson(url);
    if(url.endsWith('normalization-ledger.json')) {
      const l=value as typeof library.ledger;
      const reference=category(1).exemplars[0]!.asset; assert.ok('path' in reference);
      const asset=l.assets.find(a=>a.path===reference.path)!;
      if(alteration==='hash')asset.sha256='0'.repeat(64);
      else {asset.kind='derivative';asset.derivedFrom='sources/original.png';}
    }
    return value;
  }}));
});
test('all visual redistribution remains unresolved; empty defect arrays do not imply newly verified evidence', () => {
  assert.ok(library.ledger.assets.filter(a=>/\.(png|pdf)$/.test(a.path)).every(a=>a.redistribution==='unresolved'));
  for(const p of library.packs.values()) {
    assert.notEqual(p.license.status,'verified');
    p.documents.forEach(d=>assert.equal(d.license.status,'unknown'));
    p.exemplars.forEach(e=>{assert.equal(e.license.status,'intended');assert.deepEqual(e.approvedFeatures,['User endorsed this sheet for the named category.']);});
  }
  assert.ok(library.ledger.records.every(r=>r.unresolved.some(s=>s.includes('not a defect-free certification'))));
});
