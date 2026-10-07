import test from 'node:test';
import assert from 'node:assert/strict';
import type { Composition, Palette, Preset, RenderingSliders, StructuredPattern } from '../src/state/types.js';
import { resolveProduction, type ResolutionContext } from '../src/state/resolve-production.js';
import { createProject } from '../src/state/defaults.js';
import { project, validate, fixture } from './helpers.js';
const context=():ResolutionContext=>({validate,presets:[],randomDecisions:{},availableColorStrategies:[]});
function literal<T>(s:{global:import('../src/state/types.js').Choice<T>}):T{
  if(s.global.kind!=='literal')throw new Error('Expected literal test fixture');return structuredClone(s.global.value);
}
test('literal resolution matches independent concrete fixture and retains all instructions and evidence',()=>{
  const p=project();const before=JSON.stringify(p);const actual=resolveProduction(p,context());
  assert.deepEqual(actual,fixture('production-spec.valid'));assert.equal(JSON.stringify(p),before);
  assert.equal(actual.exemplars[0]!.doNotTransfer[0],'Identity');
  assert.equal(actual.canvas.additionalInstructions,'Contain deliberately');
});
test('resolved snapshot never shares mutable data with editable state',()=>{
  const p=project();const spec=resolveProduction(p,context());
  p.project.name='Changed';p.color.roles[0]!.displayLabel='Changed';
  assert.notEqual(spec.project.name,p.project.name);assert.notEqual(spec.color.roles[0]!.displayLabel,'Changed');
  spec.panels[0]!.composition.pose='changed';
  assert.notEqual(literal<Composition>(p.composition).pose,'changed');
});
test('preset resolution checks category and provenance and produces only concrete decisions',()=>{
  const p=project();const v=literal<Composition>(p.composition);v.pose='balanced';
  const preset:Preset={schemaVersion:'1.0',id:'official.composition-1',name:'Balanced',provenance:'official',category:'composition',value:v};
  p.composition.global={kind:'preset',reference:{presetId:preset.id,provenance:'official'}};
  const ctx=context();ctx.presets=[preset];
  assert.equal(resolveProduction(p,ctx).panels[0]!.composition.pose,'balanced');
  assert.throws(()=>resolveProduction(p,context()),/Missing or incompatible preset/);
  ctx.presets[0]={...preset,provenance:'community'};
  assert.throws(()=>resolveProduction(p,ctx),/Missing or incompatible preset/);
});
test('explicit random decisions are required, checked against candidates and never rerolled by resolution',()=>{
  const p=project();const a=literal<Composition>(p.composition);const b={...a,pose:'dynamic'};
  p.composition.global={kind:'random',candidates:[a,b]};
  assert.throws(()=>resolveProduction(p,context()),/Unresolved random choice: composition.global/);
  const ctx=context();ctx.randomDecisions={'composition.global':b};
  const first=resolveProduction(p,ctx);assert.deepEqual(resolveProduction(p,ctx),first);
  assert.equal(first.panels[0]!.composition.pose,'dynamic');
  ctx.randomDecisions['composition.global']={...b,pose:'not-a-candidate'};
  assert.throws(()=>resolveProduction(p,ctx),/outside candidates/);
});
test('uniform, manual, explicit inheritance and panel override precedence resolve correctly',()=>{
  const p=project();const global=literal<Composition>(p.composition);const manual={...global,pose:'manual'};
  p.composition.variation={mode:'manual',perPanel:{'panel-1':{kind:'literal',value:manual},'panel-2':{kind:'inherit'}}};
  assert.equal(resolveProduction(p,context()).panels[0]!.composition.pose,'manual');
  assert.equal(resolveProduction(p,context()).panels[1]!.composition.pose,global.pose);
  p.composition.perPanel['panel-1']={kind:'inherit'};
  assert.equal(resolveProduction(p,context()).panels[0]!.composition.pose,global.pose);
  p.composition.perPanel['panel-2']={kind:'literal',value:{...global,pose:'explicit'}};
  assert.equal(resolveProduction(p,context()).panels[1]!.composition.pose,'explicit');
});
test('all generic structured patterns select explicit concrete sequence entries',()=>{
  const p=project();p.canvas.grid={rows:1,columns:4};p.canvas.panels=Array.from({length:4},(_,i)=>({id:`panel-${i+1}`,row:0,column:i,rowSpan:1,columnSpan:1}));
  const a=literal<Composition>(p.composition);const sequence=[{...a,pose:'a'},{...a,pose:'b'},{...a,pose:'c'},{...a,pose:'d'}];
  const expected:Record<StructuredPattern,string[]>={role_rotation:['a','b','c','d'],alternation:['a','b','a','b'],paired_echo:['a','a','b','b'],inversion:['d','c','b','a'],progression:['a','b','c','d'],escalation:['a','b','c','d'],controlled_sequence:['a','b','c','d']};
  for(const [pattern,poses] of Object.entries(expected)){
    p.composition.variation={mode:'structured',pattern:pattern as StructuredPattern,sequence};
    assert.deepEqual(resolveProduction(p,context()).panels.map(p=>p.composition.pose),poses);
  }
  p.composition.variation={mode:'structured',pattern:'controlled_sequence',sequence:[a]};
  assert.throws(()=>resolveProduction(p,context()),/one concrete entry per panel/);
});
test('random variation resolves per panel; explicit override bypasses variation for that panel',()=>{
  const p=project();const a=literal<Composition>(p.composition),b={...a,pose:'dynamic'};
  p.composition.variation={mode:'random',candidates:[a,b]};
  p.composition.perPanel['panel-2']={kind:'literal',value:a};
  const ctx=context();ctx.randomDecisions['composition.variation.panel-1']=b;
  const spec=resolveProduction(p,ctx);assert.equal(spec.panels[0]!.composition.pose,'dynamic');
  assert.equal(spec.panels[1]!.composition.pose,a.pose);
});
test('eight sliders and independent subject/background texture and lighting survive resolution',()=>{
  const p=project();const sliders=literal<RenderingSliders>(p.sliders);sliders.backgroundAbstraction=9;
  p.sliders.perPanel['panel-2']={kind:'literal',value:sliders};
  if(p.texture.global.kind==='literal'){
    p.texture.global.value.subject.family='ben-day-dots';p.texture.global.value.background.family='stipple';
    p.texture.global.value.subject.exclusions=['Focal details'];
  }
  if(p.lightingRendering.global.kind==='literal')p.lightingRendering.global.value.backgroundLighting.direction='left';
  p.texture.additionalInstructions='Keep focal region quiet';
  const spec=resolveProduction(p,context());
  assert.equal(Object.keys(spec.panels[0]!.sliders).length,8);
  assert.equal(spec.panels[1]!.sliders.backgroundAbstraction,9);
  assert.equal(spec.panels[0]!.texture.subject.family,'ben-day-dots');assert.equal(spec.panels[0]!.texture.background.family,'stipple');
  assert.equal(spec.panels[0]!.lightingRendering.backgroundLighting.direction,'left');
  assert.equal(spec.categoryInstructions.texture,'Keep focal region quiet');
});
test('color role rotation preserves background and minor colors; overrides remain literal',()=>{
  const p=project();const palette=literal<Palette>(p.color);
  p.color.variation={mode:'structured',pattern:'role_rotation',sequence:[palette]};
  let spec=resolveProduction(p,context());
  assert.equal(spec.panels[1]!.color.assignments.find(a=>a.roleId==='role-a')!.color,'#FF8C00');
  assert.equal(spec.panels[1]!.color.assignments.find(a=>a.roleId==='background-a')!.color,'#FFFFFF');
  assert.equal(spec.panels[1]!.color.assignments.find(a=>a.roleId==='accent-a')!.color,'#0057B8');
  p.color.perPanel['panel-2']={kind:'literal',value:palette};spec=resolveProduction(p,context());
  assert.deepEqual(spec.panels[1]!.color,palette);
});
test('color progressive shift, preset and random choices resolve to explicit palettes',()=>{
  const p=project();const palette=literal<Palette>(p.color);const shifted=structuredClone(palette);shifted.assignments[0]!.color='#0088AA';
  p.color.variation={mode:'structured',pattern:'progressive_shift',sequence:[palette,shifted]};
  assert.deepEqual(resolveProduction(p,context()).panels[1]!.color,shifted);
  const preset=fixture<Preset>('preset.valid');p.color.global={kind:'preset',reference:{presetId:preset.id,provenance:'community'}};
  const ctx=context();ctx.presets=[preset];p.color.variation={mode:'random',candidates:[palette,shifted]};
  ctx.randomDecisions['color.variation.panel-1']=shifted;ctx.randomDecisions['color.variation.panel-2']=palette;
  assert.deepEqual(resolveProduction(p,ctx).panels[0]!.color,shifted);
});
test('custom identical major colors are retained, not repaired or rejected',()=>{
  const p=project();p.color.strategy={kind:'builtin',id:'custom'};
  if(p.color.global.kind==='literal')p.color.global.value.assignments.forEach(a=>a.color='#222222');
  const spec=resolveProduction(p,context());
  assert.ok(spec.panels.every(p=>p.color.assignments.every(a=>a.color==='#222222')));
});
test('pack strategy availability, established context and preset palette role compatibility are checked',()=>{
  const p=project();p.color.strategy={kind:'pack',packId:'community.color',strategyId:'custom-intervals'};
  assert.throws(()=>resolveProduction(p,context()),/Unavailable pack color strategy/);
  const ctx=context();ctx.availableColorStrategies=[{packId:'community.color',strategyId:'custom-intervals'}];
  validate('production-spec',resolveProduction(p,ctx));
  assert.throws(()=>resolveProduction(createProject('new','New'),ctx),/established Subject and Theme/);
  const preset=fixture<Preset>('preset.valid');if(preset.category==='color')preset.value.assignments[0]!.roleId='unknown';
  p.color.global={kind:'preset',reference:{presetId:preset.id,provenance:'community'}};ctx.presets=[preset];
  assert.throws(()=>resolveProduction(p,ctx),/Unknown color role/);
});
test('panel-specific roles appear only in their assigned panels',()=>{
  const p=project();p.color.relationships=[];p.color.roles.find(r=>r.id==='accent-a')!.panelScope={kind:'panels',panelIds:['panel-2']};
  const spec=resolveProduction(p,context());
  assert.equal(spec.panels[0]!.color.assignments.some(a=>a.roleId==='accent-a'),false);
  assert.equal(spec.panels[1]!.color.assignments.some(a=>a.roleId==='accent-a'),true);
});
test('color structured patterns use concrete palette sequences and preserve per-panel inheritance',()=>{
  const p=project();const a=literal<Palette>(p.color),b=structuredClone(a);b.assignments[0]!.color='#AA0055';
  for(const [pattern,expected] of [
    ['alternation',[a,b]],['paired_echo',[a,a]],['inversion',[b,a]],
    ['progressive_shift',[a,b]],['controlled_sequence',[a,b]],
  ] as const){
    p.color.variation={mode:'structured',pattern,sequence:[a,b]};
    assert.deepEqual(resolveProduction(p,context()).panels.map(p=>p.color),expected);
  }
  p.color.perPanel['panel-2']={kind:'inherit'};
  assert.deepEqual(resolveProduction(p,context()).panels[1]!.color,a);
});
test('panel palette overrides need only active roles and category instructions remain distinct',()=>{
  const p=project();p.color.relationships=[];
  p.color.roles.find(r=>r.id==='accent-a')!.panelScope={kind:'panels',panelIds:['panel-2']};
  const palette=literal<Palette>(p.color);
  p.color.perPanel['panel-1']={kind:'literal',value:{assignments:palette.assignments.filter(a=>a.roleId!=='accent-a')}};
  for(const category of ['composition','color','texture','lightingRendering','sliders','typography','props','effects'] as const)
    p[category].additionalInstructions=`Instruction for ${category}`;
  const spec=resolveProduction(p,context());
  assert.equal(spec.panels[0]!.color.assignments.length,3);
  for(const [category,instruction] of Object.entries(spec.categoryInstructions))
    assert.equal(instruction,`Instruction for ${category}`);
});
test('resolved contract forbids null context and unresolved tagged choices',()=>{
  const spec=resolveProduction(project(),context());
  assert.throws(()=>validate('production-spec',{...spec,subject:null}));
  assert.throws(()=>validate('production-spec',{...spec,panels:[{...spec.panels[0],composition:{kind:'preset',reference:{presetId:'pending',provenance:'official'}}}]}));
});
