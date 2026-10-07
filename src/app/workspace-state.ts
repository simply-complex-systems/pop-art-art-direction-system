import {synchronizeDecisions} from '../randomization/decisions.js';
import type {ApplicationState,ProjectState,Preset} from '../state/types.js';
import {backgroundCovered,reconcilePanels} from '../controls/state-edits.js';
import {createProject} from '../state/defaults.js';
import type {TabId} from './tabs.js';
import {availableLayouts,currentLayout,applyLayout} from './layouts.js';
export function createWorkspace(project=createProject('untitled','Untitled project'),appearance:ApplicationState['ui']['appearance']='light',activeTab:TabId='canvas',globalUserPresets:Preset[]=[]):ApplicationState {
  return {project:synchronizeDecisions(project),globalUserPresets,ui:{appearance,activeTab}};
}
export type WorkspaceAction={type:'loadProject';project:ProjectState}|{type:'userPresets';presets:Preset[]}|{type:'tab';tab:TabId}|{type:'appearance'}|{type:'count';count:number}
  |{type:'edit';edit:(project:ProjectState)=>ProjectState}
  |{type:'ratio';ratio:ProjectState['canvas']['aspectRatio']}|{type:'layout';id:string};
export function workspaceReducer(state:ApplicationState,action:WorkspaceAction):ApplicationState {
  if(action.type==='loadProject')return {...state,project:action.project};
  if(action.type==='userPresets')return {...state,globalUserPresets:action.presets};
  if(action.type==='tab')return {...state,ui:{...state.ui,activeTab:action.tab}};
  if(action.type==='appearance')return {...state,ui:{...state.ui,appearance:state.ui.appearance==='light'?'dark':'light'}};
  if(action.type==='edit')return {...state,project:synchronizeDecisions(action.edit(state.project))};
  const canvas=state.project.canvas;const count=action.type==='count'?action.count:canvas.panels.length;
  const ratio=action.type==='ratio'?action.ratio:canvas.aspectRatio;
  if(count>12&&action.type==='ratio')return {...state,project:{...state.project,canvas:{...canvas,aspectRatio:{...ratio}}}};
  const choices=availableLayouts(count,ratio);
  const wanted=action.type==='layout'?action.id:currentLayout(canvas)?.id;
  const layout=choices.find(l=>l.id===wanted)??choices[0]!;
  const nextCanvas=applyLayout(canvas,layout,ratio);
  if(!backgroundCovered(state.project.color.roles,nextCanvas.panels))return state;
  return {...state,project:synchronizeDecisions(reconcilePanels({...state.project,canvas:nextCanvas}))};
}
