import {useEffect,useRef} from 'react';
import type {ExportResult} from '../export/snapshot.js';
import {downloadText} from '../export/clipboard.js';
export type ProductionOutputKind='prompt'|'json';
export function ExportTab({result,preview,onPreview,onCopy,notice='',selectionRequest=0}:{result:ExportResult;preview:ProductionOutputKind;onPreview:(kind:ProductionOutputKind)=>void;onCopy:(kind:ProductionOutputKind)=>void;notice?:string;selectionRequest?:number}) {
 const area=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(selectionRequest>0&&area.current){area.current.focus();area.current.select();}},[selectionRequest]);
 const text=result.ready?result.outputs[preview]:'';
 return <section className="control-section export-panel"><h3>Production outputs</h3><p className="muted">Human prompt and production JSON use the same resolved snapshot. These previews are read-only; edit the art-direction controls to change them.</p><p className="muted">Artistic advisories do not block export. Established Subject and Theme and a valid production specification are required.</p>
 <div className="button-row"><button onClick={()=>onCopy('prompt')}>Create Prompt</button><button onClick={()=>onCopy('json')}>Create JSON</button></div>
 {notice&&<p className="export-feedback" role="status">{notice}</p>}
 {!result.ready?<p className="structural-message" role="status" data-requirement={result.kind}>{result.message}</p>:<><div className="button-row preview-switch" aria-label="Output preview"><button aria-pressed={preview==='prompt'} onClick={()=>onPreview('prompt')}>Human prompt preview</button><button aria-pressed={preview==='json'} onClick={()=>onPreview('json')}>JSON preview</button></div><label className="field output-label">{preview==='prompt'?'Production prompt preview':'Production JSON preview'}<textarea ref={area} aria-label={preview==='prompt'?'Production prompt preview':'Production JSON preview'} className={preview==='json'?'output-preview json-preview':'output-preview'} readOnly rows={24} value={text}/></label><div className="button-row"><button onClick={()=>{area.current?.focus();area.current?.select();}}>Select output</button><button onClick={()=>downloadText(text,preview==='prompt'?'production-prompt.txt':'production-spec.json',preview==='json'?'application/json':'text/plain')}>{preview==='prompt'?'Download prompt text':'Download production JSON'}</button></div><p className="muted">Source exemplar originals must accompany their references. This text/JSON export does not bundle assets.</p></>}
 </section>;
}
