import type {Preset,ProjectState,ScopedCategory,Palette,JsonValue} from '../state/types.js';
import type {LibraryRegistry} from '../pack-loader/types.js';
import type {ContractValidator} from '../state/schema-validation.js';
import {assertProjectIntegrity} from '../state/integrity.js';
import {literalValue} from '../controls/scoped.js';
import {newId} from '../controls/state-edits.js';
import {synchronizeDecisions,same} from '../randomization/decisions.js';
export type PresetCategory=Preset['category'];
export interface PresetEntry {preset:Preset;origin:'official'|'community'|'user';packName?:string|undefined}
export const PRESET_CATEGORIES:readonly PresetCategory[]=['composition','color','texture','lightingRendering','sliders','typography','props','effects','panelChoreography'];
export function presetEntries(registry:LibraryRegistry|undefined,users:readonly Preset[]):PresetEntry[] {return [...(registry?[...registry.presets.values()].map(p=>({preset:p.value,origin:p.provenance,packName:registry.packs.get(p.packId)?.displayName})):[]),...users.map(preset=>({preset,origin:'user' as const}))];}
export function capturePreset(project:ProjectState,category:PresetCategory,name:string,choreography:ScopedCategory='composition'):Preset {
 const base={schemaVersion:'1.0' as const,id:newId('user-preset'),name:name.trim()||'Untitled preset',provenance:'community' as const};
 if(category==='panelChoreography')return {...base,category,value:structuredClone({category:choreography,variation:project[choreography].variation})} as Preset;
 if(category==='typography'||category==='props'||category==='effects')return {...base,category,value:structuredClone(project[category])} as Preset;
 const value=literalValue<unknown>(project[category]);if(!value)throw new Error('Resolve the global choice before capturing this preset.');
 return {...base,category,value:structuredClone(value),...(category==='color'?{strategy:structuredClone(project.color.strategy)}:{})} as Preset;
}
export function adaptedColorPreset(project:ProjectState,entry:PresetEntry):Palette {
 if(entry.preset.category!=='color')throw new Error('Not a color preset');if(entry.origin!=='official')return structuredClone(entry.preset.value);
 const current=literalValue(project.color);if(!current)throw new Error('An Official palette example needs a concrete current palette.');
 const subject=project.color.roles.filter(r=>r.domain!=='background');const colors=entry.preset.value.assignments.map(a=>a.color);if(!colors.length)throw new Error('Palette preset has no colors.');
 return {...entry.preset.value,assignments:project.color.roles.map(r=>({roleId:r.id,color:r.domain==='background'?current.assignments.find(a=>a.roleId===r.id)!.color:colors[subject.findIndex(a=>a.id===r.id)%colors.length]!}))};
}
/** All-or-nothing compatibility: validate a detached result before replacing any live state. */
export function applyPreset(project:ProjectState,entry:PresetEntry,validate:ContractValidator,expected?:PresetCategory):ProjectState {
 const preset=entry.preset;validate('preset',preset);if(expected&&preset.category!==expected)throw new Error(`A ${preset.category} preset cannot write ${expected}.`);
 const next=structuredClone(project);
 if(preset.category==='panelChoreography'){
  const {category,variation}=preset.value;next[category].variation=structuredClone(variation) as never;
 }else if(preset.category==='typography'||preset.category==='props'||preset.category==='effects')next[preset.category]=structuredClone(preset.value) as never;
 else {const category=preset.category;next[category].global={kind:'literal',value:category==='color'?adaptedColorPreset(project,entry):structuredClone(preset.value)} as never;if(preset.category==='color'&&preset.strategy)next.color.strategy=structuredClone(preset.strategy);}
 const result=synchronizeDecisions(next);validate('project-state',result);assertProjectIntegrity(result);
 for(const category of ['composition','color','texture','lightingRendering','sliders'] as const){const v=result[category].variation;if(v.mode==='structured'&&v.pattern==='controlled_sequence'&&v.sequence.length!==result.canvas.panels.length)throw new Error('Controlled Sequence preset needs the same panel count.');}
 return result;
}
export function matchingPreset(project:ProjectState,entries:readonly PresetEntry[],category:PresetCategory):string {
 const current=category==='panelChoreography'?undefined:category==='typography'||category==='props'||category==='effects'?project[category]:literalValue<unknown>(project[category]);
 const entry=entries.find(e=>{if(e.preset.category!==category)return false;try{return same(current,category==='color'?adaptedColorPreset(project,e):e.preset.value)&&(e.preset.category!=='color'||!e.preset.strategy||same(project.color.strategy,e.preset.strategy));}catch{return false;}});return entry?.preset.id??'custom';
}
export function updateUserPreset(users:readonly Preset[],id:string,change:(preset:Preset)=>Preset,validate:ContractValidator):Preset[] {const index=users.findIndex(p=>p.id===id);if(index<0)throw new Error('Only user presets can be edited.');const next=change(structuredClone(users[index]!));if(next.id!==id||next.provenance!=='community'||next.category!==users[index]!.category)throw new Error('Preset identity/category/provenance cannot be changed by an edit.');validate('preset',next);return users.map((p,i)=>i===index?next:p);}
export function duplicatePreset(entry:PresetEntry,project:ProjectState):Preset {const preset=structuredClone(entry.preset);if(preset.category==='color'&&entry.origin==='official')preset.value=adaptedColorPreset(project,entry);return {...preset,id:newId('user-preset'),name:`${preset.name} copy`,provenance:'community'};}
export const json=(value:unknown)=>structuredClone(value) as JsonValue;
