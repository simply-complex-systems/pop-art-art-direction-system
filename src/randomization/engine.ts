import type {ProjectState,Composition,TextureTreatment,LightingRendering,RenderingSliders,ScopedCategory,Choice,CategorySetting,ColorState,Palette} from '../state/types.js';
import type {LibraryRegistry} from '../pack-loader/types.js';
import type {ResolutionContext} from '../state/resolve-production.js';
import {resolveArtDirection} from '../state/resolve-production.js';
import {generatePalette,shiftPalette,type Entropy,paletteScore} from '../color/generation.js';
import {officialOptions} from '../controls/catalog.js';
import {ASPECT_RATIOS} from '../app/ui-options.js';
import {applyLayout,availableLayouts} from '../app/layouts.js';
import {SCOPED_CATEGORIES,synchronizeDecisions} from './decisions.js';
import {assertProjectIntegrity} from '../state/integrity.js';
import {literalValue} from '../controls/scoped.js';
import {adaptedColorPreset,type PresetEntry} from '../presets/library.js';
export type RandomCategory=ScopedCategory|'canvas'|'typography'|'props'|'effects';
export type RandomScope={kind:'category';category:RandomCategory}|{kind:'artDirection'}|{kind:'everything'};
const pick=<T>(values:readonly T[],rng:Entropy):T=>values[Math.min(values.length-1,Math.floor(rng()*values.length))]!;
const integer=(min:number,max:number,rng:Entropy)=>min+Math.floor(rng()*(max-min+1));
function option(registry:LibraryRegistry|undefined,n:number,fallback:string,rng:Entropy,axis?:string):string {const options=officialOptions(registry,n,axis);return options.length?pick(options,rng).value:fallback;}
function prose<T>(previous:T,next:T):T {
 if(Array.isArray(previous)&&Array.isArray(next))return next.map((v,i)=>prose(previous[i],v)) as T;
 if(previous&&next&&typeof previous==='object'&&typeof next==='object'){const p=previous as Record<string,unknown>,n={...next} as Record<string,unknown>;for(const key of Object.keys(n)){if(key==='additionalInstructions'&&typeof p[key]==='string')n[key]=p[key];else if(key in p)n[key]=prose(p[key],n[key]);}return n as T;}return next;
}
function composition(v:Composition,registry:LibraryRegistry|undefined,rng:Entropy):Composition {
 const family=pick(['conventional','unconventional'] as const,rng);return {...v,family,technique:option(registry,family==='conventional'?2:3,v.technique??v.framing,rng),framing:option(registry,2,v.framing,rng),camera:option(registry,14,v.camera,rng),pose:option(registry,8,v.pose,rng),expression:option(registry,13,v.expression,rng),headOrientation:pick(['forward','left','right','three-quarter'] as const,rng),eyeDirection:pick(['forward','left','right'] as const,rng),subjectPlacement:{x:integer(25,75,rng)/100,y:integer(30,70,rng)/100}};
}
function texture(v:TextureTreatment,registry:LibraryRegistry|undefined,rng:Entropy):TextureTreatment {
 const layer=(old:TextureTreatment['subject'])=>({...old,family:option(registry,5,old.family,rng,'texture'),intensity:integer(1,8,rng)});
 const finishes=v.finishes.map(old=>({...old,family:option(registry,5,old.family,rng,'finish'),intensity:integer(1,8,rng)}));
 for(const scope of ['subject','background','global'] as const)if(!finishes.some(f=>f.scope===scope)){const family=option(registry,5,'none',rng,'finish');if(family!=='none')finishes.push({scope,family,intensity:integer(1,8,rng),additionalInstructions:''});}
 return {...v,backgroundField:option(registry,5,v.backgroundField,rng,'field'),environment:option(registry,12,v.environment??'solid-color-field',rng),subject:layer(v.subject),background:layer(v.background),finishes};
}
function lighting(v:LightingRendering,registry:LibraryRegistry|undefined,rng:Entropy):LightingRendering {const light=(old:LightingRendering['subjectLighting'])=>({...old,style:option(registry,6,old.style,rng),direction:pick(['front','left','right','above','behind'],rng),intensity:integer(1,10,rng)});return {...v,subjectLighting:light(v.subjectLighting),backgroundLighting:light(v.backgroundLighting),ink:option(registry,7,v.ink,rng),rendering:option(registry,11,v.rendering,rng)};}
function sliders(v:RenderingSliders,rng:Entropy):RenderingSliders {return Object.fromEntries(Object.keys(v).map(k=>[k,integer(k.endsWith('Preservation')?6:1,10,rng)])) as unknown as RenderingSliders;}
/** Preserves the active choreography mode and local prose; Random selections are committed once. */
function randomSetting<T>(setting:CategorySetting<T>,category:ScopedCategory,project:ProjectState,generate:(v:T,panel?:string)=>T,base:T,decisions:NonNullable<ProjectState['randomDecisions']>,rng:Entropy,context:ResolutionContext):CategorySetting<T> {
 const selected=(choice:Choice<T>,path:string):T=>choice.kind==='literal'?choice.value:choice.kind==='random'?(project.randomDecisions?.[path]??choice.candidates[0]) as T:context.presets.find(p=>p.id===choice.reference.presetId)!.value as T;
 const literal=(v:T):Choice<T>=>({kind:'literal',value:generate(v)});const result={...setting,global:literal(base),perPanel:{...setting.perPanel},variation:structuredClone(setting.variation)};
 for(const [id,choice] of Object.entries(setting.perPanel))if(choice.kind!=='inherit')result.perPanel[id]=literal(selected(choice,`${category}.perPanel.${id}`));
 const variation=result.variation;
 if(variation.mode==='structured')variation.sequence=variation.sequence.map(v=>generate(v));
 if(variation.mode==='manual')for(const [id,value] of Object.entries(variation.perPanel))if(value.kind!=='inherit')variation.perPanel[id]=literal(selected(value,`${category}.variation.${id}`));
 if(variation.mode==='random'){variation.candidates=variation.candidates.map(v=>generate(v));project.canvas.panels.forEach(p=>decisions[`${category}.variation.${p.id}`]=pick(variation.candidates,rng) as never);}
 return result;
}
function randomColor(state:ColorState,project:ProjectState,registry:LibraryRegistry|undefined,rng:Entropy,entries:readonly PresetEntry[],decisions:NonNullable<ProjectState['randomDecisions']>,context:ResolutionContext):ColorState {
 if(state.strategy.kind==='builtin'&&state.strategy.id==='custom')return structuredClone(state);
 const current=literalValue(state)!;const ids=project.canvas.panels.map(p=>p.id);const make=(value:Palette,panel?:string)=>{
  if(state.strategy.kind==='builtin'&&state.strategy.id==='custom')return structuredClone(value);
  let best=generatePalette(state.roles,state.relationships,panel?[panel]:ids,state.strategy,value,rng,state.strategy.kind==='pack'?registry?.packs.get(state.strategy.packId)?.colorStrategies.find(s=>s.id===(state.strategy.kind==='pack'?state.strategy.strategyId:'')):undefined);for(const entry of entries.filter(e=>e.preset.category==='color'))try{const candidate=adaptedColorPreset(project,entry);if(paletteScore(candidate,state.roles,state.relationships,panel?[panel]:ids)>paletteScore(best,state.roles,state.relationships,panel?[panel]:ids))best=candidate;}catch{/* Incompatible presets are excluded. */}return best;
 };
 const result=randomSetting(state as unknown as CategorySetting<Palette>,'color',project,make,current,decisions,rng,context) as unknown as ColorState;
 result.strategy=structuredClone(state.strategy);result.roles=structuredClone(state.roles);result.relationships=structuredClone(state.relationships);
 if(result.variation.mode==='structured'){
  const count=result.variation.sequence.length;const pattern=result.variation.pattern;const base=make(current);
  if(pattern==='role_rotation')result.variation.sequence=Array.from({length:count},()=>structuredClone(base));
  else if(pattern==='paired_echo'||pattern==='alternation'||pattern==='inversion'){const subjects=state.roles.filter(r=>r.importance==='major'&&r.domain!=='background').map(r=>r.id);const second={...base,assignments:base.assignments.map(a=>{const i=subjects.indexOf(a.roleId);return i<0?a:{...a,color:base.assignments.find(x=>x.roleId===subjects[(i+1)%subjects.length])!.color};})};result.variation.sequence=Array.from({length:count},(_,i)=>structuredClone(i%2?second:base));}
  else if(pattern==='controlled_sequence')result.variation.sequence=Array.from({length:count},(_,i)=>shiftPalette(base,(i%3-1)*.035));
  else if(pattern==='progressive_shift')result.variation.sequence=Array.from({length:count},(_,i)=>shiftPalette(base,count===1?0:i/(count-1)*.08));
 }
 return result;
}
function canvas(project:ProjectState,rng:Entropy,expand:boolean):ProjectState['canvas'] {
 const old=project.canvas;const ratio=pick(ASPECT_RATIOS,rng);let count=old.panels.length;
 // Never retire artist prose, content or exemplar bindings in a broad exploratory action.
 if(expand&&count<12&&project.color.roles.some(r=>r.domain==='background'&&r.panelScope.kind==='all'))count=integer(count+1,12,rng);
 const layouts=count<=12?availableLayouts(count,ratio):[];const result=layouts.length?applyLayout(old,pick(layouts,rng),{width:ratio.width,height:ratio.height}):{...old,aspectRatio:{width:ratio.width,height:ratio.height}};
 return {...result,outerBorder:{enabled:rng()>.15,thickness:integer(1,12,rng),color:pick(['#000000','#FFFFFF'],rng)},dividers:{enabled:rng()>.15,thickness:integer(1,12,rng),color:pick(['#000000','#FFFFFF'],rng)}};
}
function elements<T extends ProjectState['props']['elements'][number]|ProjectState['effects']['elements'][number]|ProjectState['typography']['elements'][number]>(items:T[],project:ProjectState,rng:Entropy):T[] {return items.map(v=>({...v,panelScope:rng()<.4?{kind:'all' as const}:{kind:'panels' as const,panelIds:[pick(project.canvas.panels,rng).id]},placement:pick(['center','upper left','upper right','lower left','lower right'],rng),scale:integer(5,15,rng)/10,orientation:pick(['neutral','left','right'],rng),layering:pick(['foreground','behind subject','background'],rng),...('intensity' in v?{intensity:integer(1,10,rng)}:{}),...('type' in v?{type:pick(['speech_balloon','thought_balloon','caption','title','sound_effect'],rng),style:pick(['plain','bold condensed','outlined'],rng)}:{})}));}
export function randomizeProject(project:ProjectState,scope:RandomScope,registry:LibraryRegistry|undefined,entries:readonly PresetEntry[],context:ResolutionContext,rng:Entropy=Math.random):ProjectState {
 let next=structuredClone(synchronizeDecisions(project));resolveArtDirection(next,context);const decisions={...next.randomDecisions};
 if(scope.kind==='everything'||scope.kind==='category'&&scope.category==='canvas')next.canvas=canvas(next,rng,scope.kind==='everything');
 const categories:readonly RandomCategory[]=scope.kind==='category'?[scope.category]:SCOPED_CATEGORIES;
 for(const category of categories){if(!SCOPED_CATEGORIES.includes(category as ScopedCategory))continue;
  if(category==='color'&&next.color.strategy.kind==='builtin'&&next.color.strategy.id==='custom')continue;
  for(const key of Object.keys(decisions))if(key.startsWith(category+'.'))delete decisions[key];
  const keyForBase=category as ScopedCategory;const choice=next[keyForBase].global;const base=choice.kind==='literal'?choice.value:choice.kind==='random'?next.randomDecisions?.[`${category}.global`]:context.presets.find(p=>p.id===choice.reference.presetId)?.value;
  if(category==='color'){if(next.color.global.kind!=='literal')next.color.global={kind:'literal',value:base as Palette};next.color=randomColor(next.color,next,registry,rng,entries,decisions,context);}
  else {const key=category as Exclude<ScopedCategory,'color'>;const generate=(value:unknown)=>{
    const compatible=entries.filter(e=>e.preset.category===key);const picked=compatible.length&&rng()<.2?pick(compatible,rng).preset.value:undefined;
    const raw=(key==='texture'&&picked ? {...picked as TextureTreatment,subject:{...(picked as TextureTreatment).subject,additionalInstructions:(value as TextureTreatment).subject.additionalInstructions},background:{...(picked as TextureTreatment).background,additionalInstructions:(value as TextureTreatment).background.additionalInstructions},finishes:(value as TextureTreatment).finishes.map(f=>({...f,intensity:integer(1,8,rng)}))} : picked)??(key==='composition'?composition(value as Composition,registry,rng):key==='texture'?texture(value as TextureTreatment,registry,rng):key==='lightingRendering'?lighting(value as LightingRendering,registry,rng):sliders(value as RenderingSliders,rng));return prose(value,raw);
   };next[key]=randomSetting(next[key] as CategorySetting<unknown>,key,next,generate,base,decisions,rng,context) as never;
  }
 }
 if(scope.kind==='everything'||scope.kind==='category'&&scope.category==='typography')next.typography={...next.typography,enabled:next.typography.elements.length?rng()>.15:next.typography.enabled,elements:elements(next.typography.elements,next,rng)};
 if(scope.kind==='everything'||scope.kind==='category'&&scope.category==='props')next.props={...next.props,elements:elements(next.props.elements,next,rng)};
 if(scope.kind==='everything'||scope.kind==='category'&&scope.category==='effects')next.effects={...next.effects,elements:elements(next.effects.elements,next,rng)};
 for(const key of SCOPED_CATEGORIES){const v=next[key].variation;if(v.mode==='structured'&&v.pattern==='controlled_sequence'&&v.sequence.length!==next.canvas.panels.length){const last=v.sequence.at(-1)!;v.sequence=Array.from({length:next.canvas.panels.length},(_,i)=>structuredClone(v.sequence[i]??last)) as never;}}
 next=synchronizeDecisions({...next,randomDecisions:decisions});context.validate('project-state',next);assertProjectIntegrity(next);resolveArtDirection(next,context);return next;
}
