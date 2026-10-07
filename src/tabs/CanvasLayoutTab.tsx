import {NumberField,ColorField,Instructions} from '../controls/Fields.js';
import type {Canvas} from '../state/types.js';
import {availableLayouts,currentLayout} from '../app/layouts.js';
import type {WorkspaceAction} from '../app/workspace-state.js';
import {ASPECT_RATIOS} from '../app/ui-options.js';
export function CanvasLayoutTab({canvas,dispatch,canExpandPanels=true}:{canvas:Canvas;canExpandPanels?:boolean;dispatch:(action:WorkspaceAction)=>void}) {
  const ratioId=`${canvas.aspectRatio.width}:${canvas.aspectRatio.height}`;const choices=canvas.panels.length<=12?availableLayouts(canvas.panels.length,canvas.aspectRatio):[];
  return <section className="basic-canvas" aria-label="Basic canvas settings">
    <p className="muted">Set the canvas proportions and conventional panel arrangement. Reducing panel count retires overrides, sequence slots and entries assigned only to removed panels.</p>
    <div className="canvas-controls">
      <label>Aspect ratio<select aria-label="Aspect ratio" id="aspect-ratio" value={ratioId} onChange={e=>{const ratio=ASPECT_RATIOS.find(r=>r.id===e.target.value);if(ratio)dispatch({type:'ratio',ratio:{width:ratio.width,height:ratio.height}});}}>
        {!ASPECT_RATIOS.some(r=>r.id===ratioId)&&<option value={ratioId}>{ratioId} · agent-defined</option>}
        {ASPECT_RATIOS.map(r=><option value={r.id} key={r.id}>{r.id}</option>)}</select></label>
      <label>Panel count<select aria-label="Panel count" id="panel-count" value={canvas.panels.length} onChange={e=>dispatch({type:'count',count:Number(e.target.value)})}>
        {canvas.panels.length>12&&<option value={canvas.panels.length}>{canvas.panels.length} · agent-defined</option>}
        {Array.from({length:12},(_,i)=><option value={i+1} key={i+1} disabled={!canExpandPanels&&i+1>canvas.panels.length}>{i+1}</option>)}</select></label>
      <label>Layout<select aria-label="Layout" id="canvas-layout" value={currentLayout(canvas)?.id??'agent-defined'} onChange={e=>dispatch({type:'layout',id:e.target.value})}>
        {!currentLayout(canvas)&&<option value="agent-defined">Agent-defined layout</option>}
        {choices.map(l=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label>
    </div>
    {!canExpandPanels&&<p className="muted">To add panels, first add an all-panel background color role in Color. Existing scoped backgrounds remain unchanged.</p>}
    <details className="advanced-group"><summary>Custom aspect ratio / dimensions</summary><p className="muted">Positive width and height define proportions; they are not export pixel limits.</p><div className="control-grid">
      <NumberField label="Canvas width" value={canvas.aspectRatio.width} min={0} positive step={0.01} onChange={width=>dispatch({type:'ratio',ratio:{...canvas.aspectRatio,width}})}/>
      <NumberField label="Canvas height" value={canvas.aspectRatio.height} min={0} positive step={0.01} onChange={height=>dispatch({type:'ratio',ratio:{...canvas.aspectRatio,height}})}/></div></details>
    {(['outerBorder','dividers'] as const).map(key=><fieldset key={key} className="group"><legend>{key==='outerBorder'?'Outer border':'Internal dividers'}</legend><label className="inline-check"><input type="checkbox" checked={canvas[key].enabled} onChange={e=>{const enabled=e.target.checked;dispatch({type:'edit',edit:p=>({...p,canvas:{...p.canvas,[key]:{...p.canvas[key],enabled}}})});}}/>Enabled</label><div className="control-grid">
      <NumberField label={key==='outerBorder'?'Border thickness':'Divider thickness'} value={canvas[key].thickness} min={0} onChange={thickness=>dispatch({type:'edit',edit:p=>({...p,canvas:{...p.canvas,[key]:{...p.canvas[key],thickness}}})})}/>
      <ColorField label={key==='outerBorder'?'Border color':'Divider color'} value={canvas[key].color} onChange={color=>dispatch({type:'edit',edit:p=>({...p,canvas:{...p.canvas,[key]:{...p.canvas[key],color}}})})}/></div></fieldset>)}
    <Instructions label="Canvas & Layout — Additional Instructions" value={canvas.additionalInstructions} onChange={additionalInstructions=>dispatch({type:'edit',edit:p=>({...p,canvas:{...p.canvas,additionalInstructions}})})}/>
    <p className="phase-note">Atypical arrangements remain agent-managed.</p>
  </section>;
}
