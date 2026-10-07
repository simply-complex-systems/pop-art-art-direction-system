import type {JsonValue} from '../state/types.js';
/** Native structured editor for the actual category payload, without a second art-direction model. */
export function PresetValueEditor({value,onChange,path='value'}:{value:JsonValue;onChange:(value:JsonValue)=>void;path?:string}) {
 if(Array.isArray(value))return <fieldset className="group"><legend>{path}</legend>{value.map((v,i)=><PresetValueEditor key={i} path={`${path}.${i}`} value={v} onChange={n=>onChange(value.map((old,j)=>i===j?n:old))}/>)}<div className="button-row"><button disabled={!value.length} onClick={()=>onChange([...value,structuredClone(value.at(-1)! )])}>Add {path} entry</button><button disabled={!value.length} onClick={()=>onChange(value.slice(0,-1))}>Remove last {path} entry</button></div></fieldset>;
 if(value&&typeof value==='object')return <fieldset className="group"><legend>{path}</legend><div className="control-grid">{Object.entries(value).map(([k,v])=><PresetValueEditor key={k} value={v} path={`${path}.${k}`} onChange={n=>onChange({...value,[k]:n})}/>)}</div></fieldset>;
 if(typeof value==='boolean')return <label className="inline-check"><input type="checkbox" aria-label={path} checked={value} onChange={e=>onChange(e.target.checked)}/>{path}</label>;
 return <label className="field">{path}<input aria-label={path} type={typeof value==='number'?'number':'text'} value={value===null?'':String(value)} onChange={e=>onChange(typeof value==='number'?Number(e.target.value):e.target.value)}/></label>;
}
