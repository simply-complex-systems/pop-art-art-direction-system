import test from 'node:test';
import assert from 'node:assert/strict';
import type { ContractName } from '../src/state/schema-validation.js';
import type { ApplicationState, PackManifest, Preset, ProductionSpec } from '../src/state/types.js';
import { fixture, project, validate } from './helpers.js';
import { deserializeProject, serializeProject, deserializeProduction, serializeProduction } from '../src/state/serialization.js';
import { classifyPack } from '../src/state/provenance.js';
import { createProject } from '../src/state/defaults.js';
for (const name of ['project-state','production-spec','pack','preset','feedback-ledger','project-manifest','application-state'] as ContractName[]) {
  test(`${name}: valid fixture validates; malformed fixture fails`, () => {
    validate(name,fixture(`${name}.valid`));
    assert.throws(()=>validate(name,fixture(`${name}.invalid`)),new RegExp(name));
  });
}
test('editable project round-trip preserves exact values, context, binary references, feedback and scoped choices',()=>{
  const p=project();
  p.sliders.perPanel['panel-2']={kind:'inherit'};
  p.composition.global={kind:'random',candidates:[{framing:'full-length',camera:'eye-level',pose:'still',headOrientation:'forward',eyeDirection:'image-left',expression:'calm'}]};
  assert.deepEqual(deserializeProject(serializeProject(p,validate),validate),p);
});
test('resolved production round-trip is separate from editable state',()=>{
  const spec=fixture<ProductionSpec>('production-spec.valid');
  assert.deepEqual(deserializeProduction(serializeProduction(spec,validate),validate),spec);
  assert.throws(()=>validate('project-state',spec));
  assert.throws(()=>validate('production-spec',project()));
});
test('unknown versions and unknown fields fail without silent migration or stripping',()=>{
  const p=project();
  assert.throws(()=>deserializeProject(JSON.stringify({...p,schemaVersion:'2.0'}),validate));
  assert.throws(()=>deserializeProject(JSON.stringify({...p,identityAuthoring:{}}),validate));
  assert.throws(()=>deserializeProject('{bad json',validate));
});
test('duplicate panels, duplicate roles, grid overflow and unknown scopes are rejected',()=>{
  const p=project(); p.canvas.panels[1]!.id='panel-1';
  assert.throws(()=>serializeProject(p,validate),/Duplicate panel/);
  const q=project();q.color.roles[1]!.id='role-a';
  assert.throws(()=>serializeProject(q,validate),/Duplicate color role/);
  const r=project();r.canvas.panels[1]!.column=20;
  assert.throws(()=>serializeProject(r,validate),/outside grid/);
  const s=project();s.sliders.perPanel['missing']={kind:'inherit'};
  assert.throws(()=>serializeProject(s,validate),/Unknown panel override/);
  const t=project();t.color.roles[0]!.panelScope={kind:'panels',panelIds:['missing']};
  assert.throws(()=>serializeProject(t,validate),/Unknown panel scope/);
});
test('color assignments and relationship references must resolve',()=>{
  const p=project();p.color.relationships[0]!.roleIds[1]='unknown';
  assert.throws(()=>serializeProject(p,validate),/unknown role/);
  const q=project();if(q.color.global.kind==='literal')q.color.global.value.assignments.pop();
  assert.throws(()=>serializeProject(q,validate),/Missing color assignment/);
  const r=project();r.color.roles=r.color.roles.filter(x=>x.domain!=='background');r.color.relationships=[];
  assert.throws(()=>serializeProject(r,validate),/No background role/);
});
test('portable asset paths reject traversal, absolute and platform-specific escape paths',()=>{
  for(const path of ['../x.png','exemplars/../../x.png','/x.png','C:/x.png','a\\x.png']){
    const p=project();p.exemplars[0]!.asset.path=path;
    assert.throws(()=>validate('project-state',p));
  }
});
test('unassigned context is valid editable state; defaults are generic and have no preset constraints',()=>{
  const p=createProject('generic','Untitled');
  validate('project-state',p);serializeProject(p,validate);
  assert.equal(p.subject,null);assert.equal(p.theme,null);
  assert.equal(p.color.strategy.kind,'builtin');
  assert.equal(p.typography.enabled,false);
  assert.equal(p.canvas.panels.length,1);
});
test('UI appearance is stored outside art state',()=>{
  const app=fixture<ApplicationState>('application-state.valid');
  const before=serializeProject(app.project,validate);app.ui.appearance='dark';
  assert.equal(serializeProject(app.project,validate),before);
});
test('imported self-declared Official provenance is downgraded including contained assets and presets',()=>{
  const pack=fixture<PackManifest>('pack.valid');
  pack.provenance='official';pack.exemplars[0]!.provenance='official';pack.presets[0]!.provenance='official';
  const classified=classifyPack(pack,'community_import');validate('pack',classified);
  assert.equal(classified.provenance,'community');assert.equal(classified.presets[0]!.provenance,'community');
  assert.equal(classified.exemplars[0]!.provenance,'community');assert.equal(pack.provenance,'official');
  assert.equal(classifyPack(classified,'curated_registry').provenance,'official');
});
test('preset contracts cannot redefine Subject or Theme; intended licensing is not verified',()=>{
  const preset=fixture<Preset>('preset.valid');
  assert.throws(()=>validate('preset',{...preset,subject:{packId:'other'}}));
  const pack=fixture<PackManifest>('pack.valid');pack.license.status='intended';
  validate('pack',pack);assert.equal(classifyPack(pack,'community_import').license.status,'intended');
});
test('dynamic typography, props, effects and exemplar arrays have no schema count limits',()=>{
  const p=project(); const base={panelScope:{kind:'all'} as const,placement:'center',scale:1,orientation:'upright',layering:'foreground',additionalInstructions:''};
  for(let i=0;i<150;i++){
    p.typography.elements.push({...base,id:`text-${i}`,type:'caption',content:'Text',style:'bold',cropBehavior:'contained'});
    p.props.elements.push({...base,id:`prop-${i}`,description:'Geometric object',interaction:'held',contactLogic:'supported'});
    p.effects.elements.push({...base,id:`effect-${i}`,description:'Ray',target:'role-a',intensity:5,spread:'narrow'});
    p.exemplars.push({...p.exemplars[0]!,id:`exemplar-${i+2}`});
  }
  assert.deepEqual(deserializeProject(serializeProject(p,validate),validate),p);
});
test('pack evidence may retain an external URL instead of redistributing image bytes',()=>{
  const pack=fixture<PackManifest>('pack.valid');
  pack.exemplars[0]!.asset={id:'external-1',sourceUrl:'https://example.org/reference',mediaType:'image/png'};
  validate('pack',pack);
  assert.throws(()=>validate('pack',{...pack,exemplars:[{...pack.exemplars[0],asset:{id:'unsafe',sourceUrl:'javascript:bad',mediaType:'image/png'}}]}));
});
