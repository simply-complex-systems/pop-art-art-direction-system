import test from 'node:test';
import assert from 'node:assert/strict';
import { hexToOKLab, labToLCH, perceptualDistance, separationPairs, evaluateSeparation } from '../src/color/perception.js';
import { project } from './helpers.js';
import type { Palette } from '../src/state/types.js';
test('OKLab conversions match known black, white and red values; distance is symmetric',()=>{
  const black=hexToOKLab('#000000'),white=hexToOKLab('#FFFFFF'),red=hexToOKLab('#FF0000');
  assert.equal(black.l,0);assert.ok(Math.abs(white.l-1)<1e-7);
  assert.ok(Math.abs(red.l-0.62795536)<1e-7);assert.ok(Math.abs(red.a-0.22486306)<1e-7);
  assert.ok(Math.abs(red.b-0.12584630)<1e-7);
  assert.equal(perceptualDistance('#FF0000','#FF0000'),0);
  assert.equal(perceptualDistance('#FF0000','#0000FF'),perceptualDistance('#0000FF','#FF0000'));
  assert.ok(labToLCH(red).c>0.25);assert.throws(()=>hexToOKLab('Random'));
});
test('all distinct major roles are separation candidates without declared adjacency',()=>{
  const p=project();const pairs=separationPairs(p.color.roles,[],'panel-1');
  assert.equal(pairs.length,3);
  assert.ok(pairs.some(x=>x.roleIds.includes('role-a')&&x.roleIds.includes('role-b')));
  assert.equal(pairs.some(x=>x.roleIds.includes('accent-a')),false);
});
test('declared relationships increase baseline weight and retain separator evidence',()=>{
  const p=project();const find=(rels:typeof p.color.relationships)=>separationPairs(p.color.roles,rels,'panel-1')
    .find(x=>x.roleIds.includes('role-a')&&x.roleIds.includes('role-b'))!;
  assert.ok(find(p.color.relationships).weight>find([]).weight);
  assert.equal(find(p.color.relationships).separators[0]!.type,'black_contour');
});
test('every background is checked against every major subject mass even when background is minor',()=>{
  const p=project();p.color.roles.find(r=>r.domain==='background')!.importance='minor';
  const pairs=separationPairs(p.color.roles,[],'panel-1').filter(x=>x.reasons.includes('figure_background'));
  assert.equal(pairs.length,2);
});
test('perceptual distinction and lightness separation are independently available',()=>{
  const p=project();const palette:Palette={assignments:p.color.roles.map(r=>({roleId:r.id,color:'#222222'}))};
  const before=JSON.stringify(palette);const evidence=evaluateSeparation(palette,p.color.roles,p.color.relationships,'panel-1');
  assert.ok(evidence.every(e=>e.distance===0&&e.lightnessDifference===0));
  assert.equal(JSON.stringify(palette),before);
  // Red and green can be visibly different in hue yet close in perceptual lightness.
  palette.assignments[0]!.color='#FF0000';palette.assignments[1]!.color='#009E00';
  const pair=evaluateSeparation(palette,p.color.roles,[],'panel-1').find(x=>x.roleIds.includes('role-a')&&x.roleIds.includes('role-b'))!;
  assert.ok(pair.distance>0.25);assert.ok(pair.lightnessDifference<0.03);
});
test('panel scope limits pair evaluation and explicit relationships can include minor accents',()=>{
  const p=project();p.color.roles.find(r=>r.id==='accent-a')!.panelScope={kind:'panels',panelIds:['panel-2']};
  p.color.relationships=[{roleIds:['role-a','accent-a'],type:'overlapping',panelScope:{kind:'panels',panelIds:['panel-2']},separators:[]}];
  assert.equal(separationPairs(p.color.roles,p.color.relationships,'panel-1').some(x=>x.roleIds.includes('accent-a')),false);
  assert.equal(separationPairs(p.color.roles,p.color.relationships,'panel-2').some(x=>x.roleIds.includes('accent-a')),true);
});
