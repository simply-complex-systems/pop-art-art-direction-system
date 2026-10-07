import type {Choice,OverrideChoice,ProjectState,JsonValue,ScopedCategory} from '../state/types.js';
export const SCOPED_CATEGORIES:readonly ScopedCategory[]=['composition','color','texture','lightingRendering','sliders'];
export function canonical(value:unknown):string {if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value&&typeof value==='object')return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;return JSON.stringify(value)??'undefined';}
export const same=(a:unknown,b:unknown)=>canonical(a)===canonical(b);
/** No entropy here: edits retain valid committed choices, otherwise use the first authored candidate. */
export function synchronizeDecisions(project:ProjectState):ProjectState {
 const previous=project.randomDecisions??{};const next:Record<string,JsonValue>={};
 function choice(entry:Choice<unknown>|OverrideChoice<unknown>,key:string) {if(entry.kind!=='random')return;if(!entry.candidates.length)throw new Error(`No random candidates at ${key}`);const stored=previous[key];next[key]=structuredClone(entry.candidates.some(v=>same(v,stored))?stored:entry.candidates[0]) as JsonValue;}
 for(const category of SCOPED_CATEGORIES){const setting=project[category];choice(setting.global,`${category}.global`);for(const [id,value] of Object.entries(setting.perPanel))choice(value,`${category}.perPanel.${id}`);
 if(setting.variation.mode==='random')for(const panel of project.canvas.panels)choice({kind:'random',candidates:setting.variation.candidates},`${category}.variation.${panel.id}`);
 if(setting.variation.mode==='manual')for(const [id,value] of Object.entries(setting.variation.perPanel))choice(value,`${category}.variation.${id}`);}
 if(same(previous,next))return project;if(!Object.keys(next).length){const result={...project};delete result.randomDecisions;return result;}return {...project,randomDecisions:next};
}
