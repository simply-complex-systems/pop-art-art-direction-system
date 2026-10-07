import type {ProjectState,Composition,ResolvedPanel} from '../state/types.js';
export function schematicModel(project:ProjectState,resolvedPanels?:readonly ResolvedPanel[]) {
  const ratio=project.canvas.aspectRatio.width/project.canvas.aspectRatio.height;
  const width=ratio>=1?200:200*ratio;const height=ratio>=1?200/ratio:200;
  return {width,height,panels:project.canvas.panels.map(p=>{
    const x=p.column/project.canvas.grid.columns*width;const y=p.row/project.canvas.grid.rows*height;
    const w=p.columnSpan/project.canvas.grid.columns*width;const h=p.rowSpan/project.canvas.grid.rows*height;
    // Do not resolve random/preset/structured UI choices independently of ProductionSpec.
    const setting=project.composition;const override=setting.perPanel[p.id]??(setting.variation.mode==='manual'?setting.variation.perPanel[p.id]:undefined);
    let composition:Composition|undefined;
    if(override?.kind==='literal')composition=override.value;
    else if((!override||override.kind==='inherit')&&(setting.variation.mode==='uniform'||setting.variation.mode==='manual')&&setting.global.kind==='literal')composition=setting.global.value;
    if(resolvedPanels)composition=resolvedPanels.find(panel=>panel.panelId===p.id)?.composition;
    const crop=composition?.framing;
    const mass=project.subject&&crop?(crop==='full-body'||crop==='full-length')?{x:x+w*.35,y:y+h*.12,width:w*.3,height:h*.78}
      :(crop==='head-and-shoulders'||crop==='bust-chest-up'||crop==='half-length'||crop==='three-quarter-length')?{x:x+w*.22,y:y+h*.2,width:w*.56,height:h*.85}
      :crop==='close-up'?{x:x+w*.12,y:y+h*.08,width:w*.76,height:h*1.05}:undefined:undefined;
    if(mass&&composition?.subjectPlacement){mass.x=x+w*composition.subjectPlacement.x-mass.width/2;mass.y=y+h*composition.subjectPlacement.y-mass.height/2;}
    const gaze=mass&&composition?composition.eyeDirection==='left'?-1:composition.eyeDirection==='right'?1:0:0;
    return {id:p.id,x,y,width:w,height:h,mass,gaze,crop};
  })};
}
