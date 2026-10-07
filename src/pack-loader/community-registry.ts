import type {LibraryRegistry,Registered} from './types.js';
import type {CommunityRegistry} from './community.js';
export function effectiveRegistry(official:LibraryRegistry|undefined,community:CommunityRegistry):LibraryRegistry|undefined {
 if(!official)return undefined;const packs=new Map(official.packs),options=new Map(official.options),presets=new Map(official.presets),exemplars=new Map(official.exemplars);
 function put<T>(map:Map<string,Registered<T>>,id:string,packId:string,value:T){map.set(id,{packId,provenance:'community',value});}
 for(const p of community.values()){const m=p.manifest;packs.set(m.packId,m);m.options.forEach(o=>put(options,m.packId+'::'+o.id,m.packId,o));m.presets.forEach(p=>put(presets,p.id,m.packId,p));m.exemplars.forEach(e=>put(exemplars,m.packId+'::'+e.id,m.packId,e));}
 return {...official,packs,options,presets,exemplars,optionsFor:(id,axis)=>(packs.get(id)?.options??[]).filter(o=>axis===undefined||o.axis===axis)};
}
