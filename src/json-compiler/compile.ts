import type {ProductionSpec} from '../state/types.js';
import type {ContractValidator} from '../state/schema-validation.js';
import {assertProductionIntegrity} from '../state/integrity.js';
/** Reject transient/class objects before stringification can silently drop their data. */
export function assertPortable(value:unknown):void {
 if(value===null||typeof value==='string'||typeof value==='boolean')return;
 if(typeof value==='number'){if(!Number.isFinite(value))throw new Error('Non-finite production number');return;}
 if(Array.isArray(value)){value.forEach(assertPortable);return;}
 if(value&&typeof value==='object'&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)){for(const child of Object.values(value))assertPortable(child);return;}
 throw new Error('Production JSON must contain only portable values, without browser objects');
}
function ordered(value:unknown):unknown {if(Array.isArray(value))return value.map(ordered);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>[k,ordered(v)]));return value;}
export function compileProductionJSON(spec:ProductionSpec,validate:ContractValidator):string {assertPortable(spec);validate('production-spec',spec);assertProductionIntegrity(spec);for(const asset of [...spec.subject.contextAssets,...spec.theme.contextAssets,...spec.exemplars.map(e=>e.asset)])if(/^(blob:|data:)/i.test(asset.path))throw new Error('Transient asset URL cannot be exported');return JSON.stringify(ordered(spec),null,2)+'\n';}
