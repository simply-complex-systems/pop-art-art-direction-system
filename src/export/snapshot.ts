import {canonical} from '../randomization/decisions.js';
import type {ContractValidator} from '../state/schema-validation.js';
import type {ProjectState,ProductionSpec,Preset} from '../state/types.js';
import type {ResolutionContext} from '../state/resolve-production.js';
import {resolveProduction} from '../state/resolve-production.js';
import {compileHumanPrompt} from '../prompt-compiler/compile.js';
import {compileProductionJSON} from '../json-compiler/compile.js';
export interface ProductionOutputs {snapshot:ProductionSpec;prompt:string;json:string}
const sources=new WeakMap<ProductionOutputs,{project:string;snapshot:string;presets:string}>();
/** Runtime source binding only; never exported as artistic or JSON metadata. */
export function productionSourceKey(project:ProjectState):string{const {generationHistory,feedbackLedger,...art}=project;return canonical(art);}
function activePresetKey(project:ProjectState,presets:readonly Preset[]):string{const refs=new Set<string>();const visit=(value:unknown):void=>{if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object'){const o=value as Record<string,unknown>;if(o['kind']==='preset')refs.add(canonical(o['reference']));Object.values(o).forEach(visit);}};for(const category of ['composition','color','texture','lightingRendering','sliders'] as const)visit(project[category]);return canonical([...refs].sort().map(key=>{const ref=JSON.parse(key) as {presetId:string;provenance:string};return {reference:ref,definition:presets.find(p=>p.id===ref.presetId&&p.provenance===ref.provenance)??null};}));}
/** Used for a validated loaded snapshot: presentation without another resolution. */
export function outputsFromSnapshot(project:ProjectState,snapshot:ProductionSpec,validate:ContractValidator,presets:readonly Preset[]=[]):ProductionOutputs{const outputs={snapshot,prompt:compileHumanPrompt(snapshot),json:compileProductionJSON(snapshot,validate)};sources.set(outputs,{project:productionSourceKey(project),snapshot:canonical(snapshot),presets:activePresetKey(project,presets)});return outputs;}
export function assertOutputSource(outputs:ProductionOutputs,project:ProjectState,presets:readonly Preset[]=[]):void{const source=sources.get(outputs);if(!source||source.project!==productionSourceKey(project)||source.snapshot!==canonical(outputs.snapshot)||source.presets!==activePresetKey(project,presets))throw Error('Production outputs are stale or unbound to this editable project; compile the current shared snapshot before saving.');}
/** Exactly one resolution call; both compilers receive this identical detached snapshot. */
export function compileProductionOutputs(project:ProjectState,context:ResolutionContext):ProductionOutputs {const snapshot=resolveProduction(project,{...context,includeChoreography:true});return outputsFromSnapshot(project,snapshot,context.validate,context.presets);}
export type ExportResult={ready:true;outputs:ProductionOutputs}|{ready:false;kind:'missing-context'|'structural';message:string};
export function productionExport(project:ProjectState,context:ResolutionContext):ExportResult {
 if(!project.subject||!project.theme)return {ready:false,kind:'missing-context',message:'Establish Subject and Theme with your production agent before creating the final production prompt or JSON.'};
 try{return {ready:true,outputs:compileProductionOutputs(project,context)};}catch(e){return {ready:false,kind:'structural',message:`Structural requirement: ${e instanceof Error?e.message:String(e)}`};}
}
