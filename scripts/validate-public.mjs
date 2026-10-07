import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadLibrary} from '../.test-build/src/pack-loader/registry.js';
export async function validatePublic(){const root=process.cwd(),library=existsSync('release-profile.json')?resolve('packs'):resolve('.release/public-repository/packs');
const schemas=Object.fromEntries(readdirSync('schemas').filter(n=>n.endsWith('.schema.json')).map(n=>[n,JSON.parse(readFileSync('schemas/'+n,'utf8'))]));
const registry=await loadLibrary({baseUrl:new URL('file://'+library+'/').href,source:'curated_registry',schemas,readJson:async url=>JSON.parse(readFileSync(new URL(url),'utf8'))});
if(registry.packs.size!==15||registry.ledger.assets.length!==15)throw Error('Public library must retain 15 categories and retain 15 attested originals and omit unresolved supporting binaries');
const attestations=JSON.parse(readFileSync('docs/PRIMARY_EXEMPLAR_PROVENANCE.json','utf8')).assets;const {createHash}=await import('node:crypto');
for(const p of registry.packs.values()){for(const d of p.documents)if('path'in d.asset)throw Error('Unresolved supporting document has local path');for(const e of p.exemplars){if(!('path'in e.asset))throw Error('Primary exemplar unavailable');const a=attestations.find(a=>a.path==='packs/'+e.asset.path);if(!a||createHash('sha256').update(readFileSync(resolve(library,e.asset.path))).digest('hex')!==a.sha256)throw Error('Primary visual lacks exact attestation');}}
console.log(`PASS public runtime library: ${registry.packs.size} categories, ${registry.options.size} options, ${registry.presets.size} presets, ${registry.exemplars.size} primary visual exemplars; exact hashes verified; no excluded supporting binary dependency.`);

return registry; }
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname)await validatePublic();
