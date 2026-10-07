import {useState} from 'react';
import type {ProjectState} from '../state/types.js';
import type {PresetCategory,PresetEntry} from './library.js';
import {matchingPreset} from './library.js';
export const categoryLabel=(c:string)=>({lightingRendering:'Lighting & Rendering',sliders:'Master rendering sliders',panelChoreography:'Panel choreography',props:'Props / Objects'}[c]??c[0]!.toUpperCase()+c.slice(1));
export function PresetControls({project,category,entries,apply,randomize}:{project:ProjectState;category:PresetCategory|'canvas';entries:readonly PresetEntry[];apply:(entry:PresetEntry)=>void;randomize:()=>void}){
 const [manual,setManual]=useState(false);const available=entries.filter(e=>e.preset.category===category);return <div className="preset-toolbar" aria-label={`${categoryLabel(category)} presets and randomization`}>
 {category!=='canvas'&&<label className="field">{categoryLabel(category)} preset<select aria-label={`${categoryLabel(category)} preset`} value={manual?'custom':matchingPreset(project,available,category)} onChange={e=>{setManual(e.target.value==='custom');if(e.target.value==='random')randomize();else {const selected=available.find(p=>p.preset.id===e.target.value);if(selected)apply(selected);}}}><option value="custom">Custom / Manual</option><option value="random">Random · commit a concrete choice</option>{(['official','community','user'] as const).map(origin=><optgroup key={origin} label={origin==='official'?'Official presets · read-only':origin==='community'?'Community presets · read-only':'User presets · global'}>{available.filter(e=>e.origin===origin).map(e=><option key={e.preset.id} value={e.preset.id}>{e.preset.name}{e.origin==='community'?` · Community — ${e.packName}`:''}</option>)}</optgroup>)}</select></label>}
 <button type="button" onClick={randomize}>Randomize This Category{category==='props'||category==='effects'||category==='sliders'?` · ${categoryLabel(category)}`:''}</button>
 </div>;
}
