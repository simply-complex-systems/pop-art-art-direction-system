import type { CategorySetting, Composition, LightingRendering, ProjectState, RenderingSliders,
  TextureTreatment } from './types.js';
import { SCHEMA_VERSION } from './types.js';
function setting<T>(value: T): CategorySetting<T> {
  return { global:{kind:'literal',value}, perPanel:{}, variation:{mode:'uniform'}, additionalInstructions:'' };
}
/** Unassigned context is valid editable state; production waits for established context references. */
export function createProject(id: string, name: string): ProjectState {
  const composition: Composition = { framing:'head-and-shoulders',camera:'eye-level',pose:'neutral',
    headOrientation:'forward',eyeDirection:'forward',expression:'neutral' };
  const layer = {family:'flat-field',intensity:1,region:'all',exclusions:[],additionalInstructions:''};
  const texture: TextureTreatment = {backgroundField:'flat-single-color-field',subject:{...layer},background:{...layer},finishes:[]};
  const light = {style:'front-even',direction:'front',intensity:5,colorBehavior:'neutral',additionalInstructions:''};
  const lighting: LightingRendering = {subjectLighting:{...light},backgroundLighting:{...light},ink:'clean-bold-lines',rendering:'classic-pop-art'};
  const sliders: RenderingSliders = {subjectPreservation:8,themePreservation:8,subjectAbstraction:5,
    backgroundAbstraction:3,subjectStyleIntensity:5,backgroundStyleIntensity:5,subjectTextureIntensity:3,backgroundTextureIntensity:3};
  return {
    schemaVersion:SCHEMA_VERSION,project:{id,name},subject:null,theme:null,
    canvas:{aspectRatio:{width:1,height:1},panels:[{id:'panel-1',row:0,column:0,rowSpan:1,columnSpan:1}],
      grid:{rows:1,columns:1},outerBorder:{enabled:true,thickness:8,color:'#000000'},
      dividers:{enabled:true,thickness:8,color:'#000000'},additionalInstructions:''},
    composition:setting(composition),
    color:{strategy:{kind:'builtin',id:'high_contrast_structured'},
      roles:[{id:'role-a',importance:'major',domain:'subject',panelScope:{kind:'all'}},
        {id:'role-b',importance:'major',domain:'subject',panelScope:{kind:'all'}},
        {id:'background-a',importance:'major',domain:'background',panelScope:{kind:'all'}}],
      relationships:[],global:{kind:'literal',value:{assignments:[{roleId:'role-a',color:'#0057B8'},
        {roleId:'role-b',color:'#FF8C00'},{roleId:'background-a',color:'#FFFFFF'}]}},
      perPanel:{},variation:{mode:'uniform'},additionalInstructions:''},
    texture:setting(texture),lightingRendering:setting(lighting),sliders:setting(sliders),
    typography:{enabled:false,elements:[],additionalInstructions:''},props:{elements:[],additionalInstructions:''},
    effects:{elements:[],additionalInstructions:''},exemplars:[],generationHistory:[],
    feedbackLedger:{schemaVersion:SCHEMA_VERSION,records:[]},
  };
}
