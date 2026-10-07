import {useState,type ReactNode} from 'react';
import type {Canvas,VariationRule} from '../state/types.js';
import {literalValue,isOverridden,editTarget,changeMode,type EditableSetting} from './scoped.js';
import {Select,Instructions} from './Fields.js';
import {systemOptions} from './catalog.js';
const PATTERNS=['role_rotation','alternation','paired_echo','inversion','progression','escalation','controlled_sequence'] as const;
const COLOR_PATTERNS=['role_rotation','alternation','paired_echo','inversion','progressive_shift','controlled_sequence'] as const;
export function ScopedEditor<T,S extends EditableSetting<T>>({title,setting,panels,onChange,render,color=false}:{title:string;setting:S;panels:Canvas['panels'];onChange:(s:S)=>void;render:(v:T,change:(v:T)=>void)=>ReactNode;color?:boolean}) {
  const [target,setTarget]=useState('global');const validTarget=target==='global'||panels.some(p=>p.id===target)?target:'global';
  const value=literalValue<T>(setting,validTarget==='global'?undefined:validTarget);const global=literalValue<T>(setting);const overridden=validTarget==='global'||isOverridden(setting,validTarget);
  const variation=setting.variation;const patterns=color?COLOR_PATTERNS:PATTERNS;
  function variationChange(next:EditableSetting<T>['variation']) {onChange({...setting,variation:next});}
  return <section className="control-section" aria-label={title}><h3>{title}</h3><div className="scope-bar">
    <label className="field">Editing scope<select aria-label="Editing scope" value={validTarget} onChange={e=>setTarget(e.target.value)}><option value="global">Global</option>{panels.map((p,i)=><option key={p.id} value={p.id}>Panel {i+1}</option>)}</select></label>
    <Select label="Panel Variation Logic" value={variation.mode} options={systemOptions(['uniform','structured','random','manual'])} onChange={mode=>{if(global)onChange(changeMode<T,S>(setting,mode as VariationRule<T>['mode'],global,panels.length));}}/>
    {validTarget!=='global'&&<label className="inline-check"><input type="checkbox" checked={overridden} disabled={!value} onChange={e=>onChange(editTarget<T,S>(setting,validTarget,e.target.checked?value:undefined))}/>Override this panel</label>}
  </div>
  {!overridden&&<p className="muted">This panel follows the global choice and variation rule. Enable an override to edit its concrete values.</p>}
  {overridden&&value!==undefined?render(value,next=>onChange(editTarget<T,S>(setting,validTarget,next))):overridden&&<p className="muted">A stored preset or random choice is unresolved. Preserve it or replace it with a concrete global value before editing.</p>}
  {variation.mode==='structured'&&<details className="variation-details"><summary>Structured choreography · {variation.pattern.replaceAll('_',' ')} · {variation.sequence.length} authored values</summary>
    <Select label="Structured pattern" value={variation.pattern} options={systemOptions(patterns)} onChange={pattern=>{let sequence=variation.sequence;if(pattern==='controlled_sequence')sequence=Array.from({length:panels.length},(_,i)=>structuredClone(sequence[i]??sequence.at(-1)!));variationChange({...variation,pattern:pattern as typeof variation.pattern,sequence});}}/>
    <p className="muted">Choreography uses these authored values. Identical values remain identical; this editor does not generate variations.</p>
    {variation.sequence.map((v,i)=><details key={i} className="item-card"><summary>Sequence value {i+1}</summary>{render(v,next=>variationChange({...variation,sequence:variation.sequence.map((old,j)=>j===i?next:old)}))}</details>)}
    {variation.pattern!=='controlled_sequence'&&<div className="button-row"><button onClick={()=>variationChange({...variation,sequence:[...variation.sequence,structuredClone(variation.sequence.at(-1)!)]})}>Add sequence value</button><button disabled={variation.sequence.length<=1} onClick={()=>variationChange({...variation,sequence:variation.sequence.slice(0,-1)})}>Remove last value</button></div>}
  </details>}
  {variation.mode==='random'&&<details className="variation-details"><summary>Random candidates · {variation.candidates.length} authored values</summary><p className="muted">Concrete selections are committed and remain stable. Randomize This Category to explore again; editing candidates updates only invalidated selections.</p>{variation.candidates.map((v,i)=><details key={i} className="item-card"><summary>Candidate {i+1}</summary>{render(v,next=>variationChange({...variation,candidates:variation.candidates.map((old,j)=>j===i?next:old)}))}<button disabled={variation.candidates.length<=1} onClick={()=>variationChange({...variation,candidates:variation.candidates.filter((_,j)=>j!==i)})}>Remove candidate</button></details>)}<button onClick={()=>variationChange({...variation,candidates:[...variation.candidates,structuredClone(variation.candidates.at(-1)!)]})}>Add candidate</button></details>}
  {variation.mode==='manual'&&<p className="muted">Choose a panel above to author its manual value. Unassigned panels inherit the global choice.</p>}
  <Instructions label={`${title} — Additional Instructions`} value={setting.additionalInstructions} onChange={additionalInstructions=>onChange({...setting,additionalInstructions})}/>
  </section>;
}
