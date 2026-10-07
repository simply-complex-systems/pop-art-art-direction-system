import type {ColorState,ColorRole,Palette,ProjectState,PanelScope,ElementBase,PrintFinish,TextureTreatment,ProductionExemplar} from '../state/types.js';
import {applies} from '../state/integrity.js';
export function newId(prefix:string):string {return `${prefix}-${crypto.randomUUID()}`;}
export function elementBase(id:string):ElementBase {return {id,panelScope:{kind:'all'},placement:'center',scale:1,orientation:'neutral',layering:'foreground',additionalInstructions:''};}
function mapPalettes(value:unknown,edit:(p:Palette)=>Palette):unknown {
  if(Array.isArray(value))return value.map(v=>mapPalettes(v,edit));
  if(value&&typeof value==='object') {const o=value as Record<string,unknown>;if(Array.isArray(o['assignments']))return edit(o as unknown as Palette);
    return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,mapPalettes(v,edit)]));}
  return value;
}
export function updateRoles(color:ColorState,roles:ColorRole[]):ColorState {
  const known=new Set(roles.map(r=>r.id));
  const next=mapPalettes(color,p=>({...p,assignments:roles.map(r=>({roleId:r.id,color:p.assignments.find(a=>a.roleId===r.id)?.color??'#808080'}))})) as ColorState;
  next.roles=roles;next.relationships=next.relationships.filter(r=>r.roleIds.every(id=>known.has(id))).flatMap(r=>{const a=roles.find(role=>role.id===r.roleIds[0])!;const b=roles.find(role=>role.id===r.roleIds[1])!;if(a.panelScope.kind==='all'&&b.panelScope.kind==='all')return [r];const candidates=r.panelScope.kind==='panels'?r.panelScope.panelIds:a.panelScope.kind==='panels'?a.panelScope.panelIds:b.panelScope.kind==='panels'?b.panelScope.panelIds:[];const panelIds=candidates.filter(id=>applies(a.panelScope,id)&&applies(b.panelScope,id));return panelIds.length?[{...r,panelScope:{kind:'panels' as const,panelIds}}]:[];});
  return next;
}
export function backgroundCovered(roles:ColorRole[],panels:ProjectState['canvas']['panels']):boolean {
  return panels.every(p=>roles.some(r=>r.domain==='background'&&applies(r.panelScope,p.id)));
}
export function commonScope(a:ColorRole,b:ColorRole,panels:ProjectState['canvas']['panels']):PanelScope|undefined {
  if(a.panelScope.kind==='all'&&b.panelScope.kind==='all')return {kind:'all'};
  const ids=panels.filter(p=>applies(a.panelScope,p.id)&&applies(b.panelScope,p.id)).map(p=>p.id);
  return ids.length?{kind:'panels',panelIds:ids}:undefined;
}
export function updateFinish(t:TextureTreatment,scope:PrintFinish['scope'],finish:PrintFinish|undefined):TextureTreatment {
  return {...t,finishes:[...t.finishes.filter(f=>f.scope!==scope),...(finish?[finish]:[])]};
}
/** A count reduction retires bindings for the removed panels; it never relabels them as another panel. */
export function reconcilePanels(project:ProjectState):ProjectState {
  const ids=new Set(project.canvas.panels.map(p=>p.id));
  function trim(value:unknown):unknown {
    if(Array.isArray(value))return value.map(trim).filter(v=>v!==undefined);
    if(!value||typeof value!=='object')return value;
    const o=value as Record<string,unknown>;const scope=o['panelScope'] as PanelScope|undefined;
    if(scope?.kind==='panels'&&!scope.panelIds.some(id=>ids.has(id)))return undefined;
    return Object.fromEntries(Object.entries(o).map(([key,v])=>[key,key==='perPanel'?Object.fromEntries(Object.entries(v as object).filter(([id])=>ids.has(id)).map(([id,x])=>[id,trim(x)]))
      :key==='panelScope'&&scope?.kind==='panels'?{kind:'panels',panelIds:scope.panelIds.filter(id=>ids.has(id))}:trim(v)]));
  }
  const result=trim(project) as ProjectState;
  const existing=new Set(result.color.roles.map(r=>r.id));
  result.color=mapPalettes(result.color,p=>({...p,assignments:p.assignments.filter(a=>existing.has(a.roleId))})) as ColorState;
  result.color.relationships=result.color.relationships.filter(r=>r.roleIds.every(id=>existing.has(id)));
  // Existing explicit sequences retain their authored entries; new slots inherit the last authored value.
  for(const setting of [result.composition,result.color,result.texture,result.lightingRendering,result.sliders]) {
    if(setting.variation.mode==='structured'&&setting.variation.pattern==='controlled_sequence') {
      const sequence=setting.variation.sequence;const last=sequence.at(-1);
      if(last)setting.variation.sequence=Array.from({length:ids.size},(_,i)=>structuredClone(sequence[i]??last)) as typeof sequence;
    }
  }
  return result;
}
export async function exemplarFromFile(file:File,id:string):Promise<ProductionExemplar> {
  const bytes=await file.arrayBuffer();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  const ext=file.name.split('.').at(-1)?.replace(/[^a-z0-9]/gi,'').toLowerCase()||'bin';
  return {id,asset:{id:`asset-${id}`,path:`assets/exemplars/${id}.${ext}`,mediaType:file.type||'application/octet-stream',sha256:hash},name:file.name,role:'composition',panelScope:{kind:'all'},transfer:[],doNotTransfer:[],notes:''};
}
