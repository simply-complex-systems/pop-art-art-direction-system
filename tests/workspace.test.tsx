import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {createWorkspace,workspaceReducer} from '../src/app/workspace-state.js';
import {TABS,nextTab,readTab,TAB_STORAGE_KEY} from '../src/app/tabs.js';
import {availableLayouts,currentLayout,applyLayout} from '../src/app/layouts.js';
import {schematicModel} from '../src/app/schematic.js';
import {SummaryStrip} from '../src/components/SummaryStrip.js';
import {QUICK_ACTIONS} from '../src/app/ui-options.js';
import {WorkspaceNavigation} from '../src/components/WorkspaceNavigation.js';
import {SchematicPreview} from '../src/components/SchematicPreview.js';
import {PlaceholderTab} from '../src/tabs/PlaceholderTab.js';
import {advisorySummary,type Advisory} from '../src/validation/advisories.js';
import {assertProjectIntegrity} from '../src/state/integrity.js';
import {validate} from './helpers.js';
test('all 11 final tabs are reachable and navigation preserves exact ProjectState reference',()=>{
  let s=createWorkspace();const original=s.project;assert.equal(TABS.length,11);
  for(const t of TABS) {s=workspaceReducer(s,{type:'tab',tab:t.id});assert.equal(s.ui.activeTab,t.id);assert.equal(s.project,original);
    const nav=renderToStaticMarkup(<WorkspaceNavigation activeTab={t.id} onSelect={()=>{}}/>);assert.match(nav,new RegExp(`id="tab-${t.id}"`));assert.match(nav,/aria-selected="true"/);assert.ok(!nav.includes('disabled'));
    assert.match(renderToStaticMarkup(<SummaryStrip project={s.project} advisories={[]}/>),/Persistent project summary/);
  }
});
test('unassigned and generic authored Subject/Theme contexts render independently without editors',()=>{
  const s=createWorkspace();let html=renderToStaticMarkup(<SummaryStrip project={s.project} advisories={[]}/>);
  assert.equal((html.match(/Not established/g)??[]).length,2);assert.ok(!html.includes('<input'));assert.ok(!html.includes('<select'));
  s.project.subject={packId:'subject.mechanical-owl',displayName:'Mechanical Owl',provenance:'community',contextAssets:[]};
  s.project.theme={packId:'theme.winter-festival',displayName:'Winter Festival',provenance:'community',contextAssets:[]};
  html=renderToStaticMarkup(<SummaryStrip project={s.project} advisories={[]}/>);assert.match(html,/Mechanical Owl/);assert.match(html,/Winter Festival/);validate('project-state',s.project);
});
test('curated 1–12 panel arrangements cover grids with no overlap and validate against approved ProjectState',()=>{
  const s=createWorkspace();for(let n=1;n<=12;n++)for(const ratio of [{width:1,height:1},{width:16,height:9},{width:9,height:16}])for(const l of availableLayouts(n,ratio)) {
    const p={...s.project,canvas:applyLayout(s.project.canvas,l,ratio)};assert.equal(p.canvas.panels.length,n);assertProjectIntegrity(p);validate('project-state',p);
    assert.equal(l.cells.reduce((sum,c)=>sum+c.rowSpan*c.columnSpan,0),l.grid.rows*l.grid.columns);
  }
});
test('panel count drives choices, retains surviving IDs and reconciles incompatible layout to first conventional choice',()=>{
  let s=createWorkspace();s=workspaceReducer(s,{type:'count',count:3});s=workspaceReducer(s,{type:'layout',id:'featured-3-left'});
  assert.equal(currentLayout(s.project.canvas)?.id,'featured-3-left');s=workspaceReducer(s,{type:'count',count:4});assert.equal(currentLayout(s.project.canvas)?.id,'grid-2-2');
  assert.equal(s.project.canvas.panels[0]!.id,'panel-1');assert.equal(availableLayouts(4,{width:16,height:9}).length,2);assert.equal(availableLayouts(4,{width:1,height:1}).length,1);
  s=workspaceReducer(s,{type:'layout',id:'unknown'});assert.equal(currentLayout(s.project.canvas)?.id,'grid-2-2');
});
test('aspect ratio and layout update schematic geometry; unsuitable strip layouts reconcile predictably',()=>{
  let s=createWorkspace();const initial=schematicModel(s.project);s=workspaceReducer(s,{type:'count',count:4});s=workspaceReducer(s,{type:'ratio',ratio:{width:16,height:9}});
  s=workspaceReducer(s,{type:'layout',id:'grid-1-4'});const cols=schematicModel(s.project);assert.notEqual(cols.height,initial.height);assert.equal(cols.panels[1]!.y,0);
  s=workspaceReducer(s,{type:'layout',id:'grid-2-2'});const square=schematicModel(s.project);assert.ok(square.panels[2]!.y>0);
  s=workspaceReducer(s,{type:'layout',id:'grid-1-4'});s=workspaceReducer(s,{type:'ratio',ratio:{width:3,height:4}});assert.equal(currentLayout(s.project.canvas)?.id,'grid-2-2');
});
test('schematic has no controls or image assets and shows mass only for authored subject and literal supported framing',()=>{
  const p=createWorkspace().project;assert.ok(schematicModel(p).panels.every(s=>!s.mass));
  p.subject={packId:'generic',displayName:'Mechanical Owl',provenance:'community',contextAssets:[]};assert.ok(schematicModel(p).panels[0]!.mass);
  const html=renderToStaticMarkup(<SchematicPreview project={p}/>);assert.match(html,/Display only/);assert.ok(!/<(image|button|input|select)\b/.test(html));assert.ok(!html.includes('tabindex'));
  p.composition.global={kind:'random',candidates:[]};assert.ok(!schematicModel(p).panels[0]!.mass);
});
test('appearance and tab preferences remain separate from production state',()=>{
  const s=createWorkspace();const next=workspaceReducer(s,{type:'appearance'});assert.equal(next.project,s.project);assert.equal(next.ui.appearance,'dark');
  assert.equal(readTab({getItem:key=>key===TAB_STORAGE_KEY?'export':null}),'export');assert.equal(readTab({getItem:()=> 'unknown'}),'canvas');assert.equal(readTab({getItem:()=>{throw Error();}}),'canvas');
});
test('keyboard tabs support wrapping arrows and Home/End with conventional ARIA relationships',()=>{
  assert.equal(nextTab('canvas','ArrowUp'),'export');assert.equal(nextTab('export','ArrowDown'),'canvas');assert.equal(nextTab('color','Home'),'canvas');assert.equal(nextTab('color','End'),'export');
  const html=renderToStaticMarkup(<WorkspaceNavigation activeTab="color" onSelect={()=>{}}/>);assert.match(html,/aria-orientation="vertical"/);assert.equal((html.match(/tabindex="0"/g)??[]).length,1);assert.match(html,/aria-controls="panel-color"/);
});
test('zero, information, one and multiple advisory warnings are generic non-blocking display reports',()=>{
  assert.equal(advisorySummary([]),'No advisories');const info:Advisory={id:'info',severity:'info',message:'Context is established',category:'project'};
  assert.equal(advisorySummary([info]),'1 informational');const a:Advisory={id:'one',severity:'warning',message:'Review density',category:'composition'};
  assert.equal(advisorySummary([a]),'1 warning');assert.equal(advisorySummary([a,{...a,id:'two'},info]),'2 warnings · 1 informational');
  const html=renderToStaticMarkup(<SummaryStrip project={createWorkspace().project} advisories={[a,{...a,id:'two'}]}/>);assert.match(html,/Composition/);assert.match(html,/Review density/);
});
test('all quick actions remain explicitly disabled and substantive tabs point to designated phases',()=>{
  const html=renderToStaticMarkup(<SummaryStrip project={createWorkspace().project} advisories={[]}/>);assert.equal((html.match(/disabled=""/g)??[]).length,5);
  QUICK_ACTIONS.forEach(a=>assert.ok(html.includes(a.name)));for(const t of TABS.filter(t=>t.id!=='canvas'))assert.match(renderToStaticMarkup(<PlaceholderTab tab={t.id}/>),new RegExp(`Phase ${t.phase}`));
});
test('new panel IDs avoid collisions with agent-supplied IDs',()=>{
  let s=createWorkspace();s.project.canvas.panels[0]!.id='panel-2';s=workspaceReducer(s,{type:'count',count:3});
  assert.equal(s.project.canvas.panels[0]!.id,'panel-2');assert.equal(new Set(s.project.canvas.panels.map(p=>p.id)).size,3);assertProjectIntegrity(s.project);validate('project-state',s.project);
});
test('agent-defined layouts outside the basic chooser stay displayable without changing their arrangement',()=>{
  let s=createWorkspace();s.project.canvas={...s.project.canvas,grid:{rows:1,columns:13},panels:Array.from({length:13},(_,i)=>({id:`custom-${i}`,row:0,column:i,rowSpan:1,columnSpan:1}))};
  assert.match(renderToStaticMarkup(<SummaryStrip project={s.project} advisories={[]}/>),/Agent-defined layout/);
  const panels=s.project.canvas.panels;s=workspaceReducer(s,{type:'ratio',ratio:{width:4,height:3}});assert.equal(s.project.canvas.panels,panels);validate('project-state',s.project);assertProjectIntegrity(s.project);
});
