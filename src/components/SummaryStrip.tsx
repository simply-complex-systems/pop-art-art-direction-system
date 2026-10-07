import type {ProjectState,ResolvedPanel} from '../state/types.js';
import type {Advisory} from '../validation/advisories.js';
import {advisorySummary} from '../validation/advisories.js';
import {currentLayout} from '../app/layouts.js';
import {TABS} from '../app/tabs.js';
import {SchematicPreview} from './SchematicPreview.js';
import {QUICK_ACTIONS} from '../app/ui-options.js';
export function SummaryStrip({project,advisories,resolvedPanels,onArtDirection,onEverything,onPrompt,onJSON,onSave,packageNotice,exportNotice}:{project:ProjectState;advisories:readonly Advisory[];resolvedPanels?:readonly ResolvedPanel[];onArtDirection?:()=>void;onEverything?:()=>void;onPrompt?:()=>void;onJSON?:()=>void;onSave?:()=>void;packageNotice?:string;exportNotice?:string}) {
  return <section className="summary-strip" aria-label="Persistent project summary">
    <div className="summary-content">
      <dl className="context-summary">
        <div><dt>Subject</dt><dd>{project.subject?.displayName??'Not established'}</dd></div>
        <div><dt>Theme</dt><dd>{project.theme?.displayName??'Not established'}</dd></div>
        <div><dt>Panels</dt><dd>{project.canvas.panels.length}</dd></div>
        <div><dt>Aspect ratio</dt><dd>{project.canvas.aspectRatio.width}:{project.canvas.aspectRatio.height}</dd></div>
        <div><dt>Layout</dt><dd>{currentLayout(project.canvas)?.name??'Agent-defined layout'}</dd></div>
      </dl>
      <div className="advisory-status" data-warning-count={advisories.filter(a=>a.severity==='warning').length}>
        <p role="status">{advisorySummary(advisories)}</p>
        {advisories.length>0&&<details><summary>Advisory details</summary><ul>{advisories.map(a=><li key={a.id}>
          <strong>{a.category?TABS.find(t=>t.id===a.category)?.label+': ':''}</strong>{a.message}</li>)}</ul></details>}
      </div>
      <div className="quick-actions" aria-label="Persistent quick actions">
        {QUICK_ACTIONS.map((a,i)=>{const action=i===0?onArtDirection:i===1?onEverything:i===2?onSave:i===3?onPrompt:i===4?onJSON:undefined;return <button key={a.name} type="button" disabled={!action} onClick={action} title={action?(i===3||i===4?'Compile and copy the current resolved production':'Commit a concrete configuration'):`Available in Phase ${a.phase}`}>{a.name}</button>;})}
      </div>
      <p className="availability-note">Randomization preserves artist prose. Save Project preserves the portable creative record.</p>
      {packageNotice&&<p className="package-save-notice" role="status">{packageNotice}</p>}
      {exportNotice&&<p className="clipboard-notice" role="status">{exportNotice}</p>}
    </div>
    <SchematicPreview project={project} {...(resolvedPanels?{resolvedPanels}:{})}/>
  </section>;
}
