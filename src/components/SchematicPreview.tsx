import type {ProjectState,ResolvedPanel} from '../state/types.js';
import {schematicModel} from '../app/schematic.js';
export function SchematicPreview({project,resolvedPanels}:{project:ProjectState;resolvedPanels?:readonly ResolvedPanel[]}) {
  const model=schematicModel(project,resolvedPanels);
  return <figure className="schematic" aria-label="Display-only spatial schematic">
    <svg role="img" aria-labelledby="schematic-title schematic-description" viewBox={`0 0 ${model.width} ${model.height}`} data-testid="schematic">
      <title id="schematic-title">{`${project.canvas.panels.length}-panel spatial schematic`}</title>
      <desc id="schematic-description">Display only. {project.canvas.aspectRatio.width}:{project.canvas.aspectRatio.height} canvas.
        {project.subject?' Shaded rectangles represent approximate framing where literal state is available.':' Subject not established; no subject placement shown.'}</desc>
      <defs>{model.panels.map(p=><clipPath id={`clip-${p.id}`} key={p.id}><rect x={p.x+2} y={p.y+2} width={Math.max(0,p.width-4)} height={Math.max(0,p.height-4)}/></clipPath>)}</defs>
      {model.panels.map((p,i)=><g key={p.id} data-panel-id={p.id}>
        <rect className="schematic-panel" x={p.x+1} y={p.y+1} width={p.width-2} height={p.height-2}/>
        {p.mass&&<g clipPath={`url(#clip-${p.id})`}><rect className="schematic-mass" {...p.mass}/>
          {p.gaze!==0&&<path className="schematic-gaze" d={`M ${p.mass.x+p.mass.width/2} ${p.mass.y+p.mass.height*.25} l ${p.gaze*p.width*.2} 0`}/>}</g>}
        <text className="schematic-label" x={p.x+7} y={p.y+13}>{i+1}</text>
      </g>)}
    </svg>
    <figcaption>Spatial schematic · display only</figcaption>
  </figure>;
}
