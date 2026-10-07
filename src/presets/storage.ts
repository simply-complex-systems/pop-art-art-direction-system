import type {Preset} from '../state/types.js';
import type {ContractValidator} from '../state/schema-validation.js';
export const USER_PRESETS_KEY='pop-art.user-presets.v1';
export interface PresetStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
export function readUserPresets(storage:Pick<PresetStorage,'getItem'>|undefined,validate:ContractValidator):{presets:Preset[];message?:string} {
 try {const raw=storage?.getItem(USER_PRESETS_KEY);if(!raw)return {presets:[]};const data:unknown=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid preset store');const store=data as Record<string,unknown>;if(store['schemaVersion']!=='1.0'||!Array.isArray(store['presets'])||Object.keys(store).some(k=>!['schemaVersion','presets'].includes(k)))throw new Error('Invalid preset store');const ids=new Set<string>();
 for(const preset of store['presets']){validate('preset',preset);const p=preset as Preset;if(p.provenance!=='community'||ids.has(p.id))throw new Error('Invalid user preset provenance or duplicate ID');ids.add(p.id);}return {presets:store['presets'] as Preset[]};
 }catch{return {presets:[],message:'Stored user presets could not be validated. The saved data has not been overwritten.'};}
}
export function saveUserPresets(storage:Pick<PresetStorage,'setItem'>|undefined,presets:readonly Preset[],validate:ContractValidator):string|undefined {
 try{for(const p of presets){validate('preset',p);if(p.provenance!=='community')throw new Error('Official presets cannot enter user storage');}if(!storage)return 'Preset storage is unavailable. Changes remain in this session.';storage.setItem(USER_PRESETS_KEY,JSON.stringify({schemaVersion:'1.0',presets}));return undefined;}catch{return 'Could not save global user presets. Changes remain in this session.';}
}
