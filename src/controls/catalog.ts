import type {LibraryRegistry} from '../pack-loader/types.js';
export interface Option {value:string;label:string;source:'official'|'community'|'system'|'stored';packName?:string|undefined}
export function officialOptions(registry:LibraryRegistry|undefined,category:number,axis?:string):Option[] {
  const entry=registry?.catalog.categories.find(c=>c.number===category);
  const official:Option[]=entry?registry!.optionsFor(entry.packId,axis).map(o=>({value:o.id,label:o.label,source:'official'})):[];
  const slots:Record<number,[string,string?]>= {2:['composition'],3:['composition'],4:['color'],5:[axis==='texture'?'texture':axis==='finish'?'print':'background',axis??'field'],6:['lighting'],7:['rendering','ink'],8:['pose'],9:['color',axis??'palette-mood'],11:['rendering','rendering'],12:['environment'],13:['expression'],14:['camera'],15:['props']};const slot=slots[category];
  return [...official,...(registry&&slot?[...registry.options.values()].filter(r=>r.provenance==='community'&&r.value.category===slot[0]&&(!slot[1]||r.value.axis===slot[1])).map(r=>({value:String(r.value.value),label:r.value.label,source:'community' as const,packName:registry.packs.get(r.packId)?.displayName})):[])];
}
export function systemOptions(values:readonly string[]):Option[] {return values.map(value=>({value,label:value.replaceAll('_',' ').replaceAll('-',' '),source:'system'}));}
export const MASTER_LABELS={subjectPreservation:'Subject Preservation',themePreservation:'Theme Preservation',subjectAbstraction:'Subject Abstraction',backgroundAbstraction:'Environment / Background Abstraction',subjectStyleIntensity:'Subject Style Intensity',backgroundStyleIntensity:'Environment / Background Style Intensity',subjectTextureIntensity:'Subject Texture Intensity',backgroundTextureIntensity:'Environment / Background Texture Intensity'} as const;

export function communityOptions(registry:LibraryRegistry|undefined,category:string,axis?:string):Option[]{return registry?[...registry.options.values()].filter(r=>r.provenance==='community'&&r.value.category===category&&(!axis||r.value.axis===axis)&&typeof r.value.value==='string').map(r=>({value:String(r.value.value),label:r.value.label,source:'community',packName:registry.packs.get(r.packId)?.displayName})):[];}
