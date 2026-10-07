import {readFileSync} from 'node:fs';
import {phase7Project} from './phase7-data.js';
import {createIteration,updateIteration,type AssetStore} from '../src/project-package/assets.js';
import type {ProductionOutputs} from '../src/export/snapshot.js';
export const dossierFont=new Uint8Array(readFileSync('src/pdf/fonts/DejaVuSans.ttf'));
export const fixturePng=(name='placement-review.png')=>new Uint8Array(readFileSync('tests/fixtures/reference-files/'+name));
export async function phase8Data(outputs?:ProductionOutputs,kind='complex'){
 let project=phase7Project(kind);project.project={...project.project,name:kind==='missing'?'Uncalibrated personal project':'Mechanical Owl - Winter study'};const assets:AssetStore=new Map();
 for(const e of project.exemplars){const name=e.asset.path.split('/').at(-1)!;assets.set(e.asset.id,{blob:new Blob([fixturePng(name)],{type:'image/png'}),originalName:name});}
 if(kind!=='missing')for(const [i,status] of (['accepted','working','rejected'] as const).entries()){
  const name=i===1?'unassigned-review.png':'placement-review.png';const file=new File([fixturePng(name)],name,{type:'image/png'});const c=await createIteration(file,`iteration-${i+1}`,outputs?.snapshot,'2026-10-07T12:00:00.000Z');c.generation.label=['Accepted placement study','Working composition exploration','Rejected crop study'][i]!;for(const [id,a] of c.assets)assets.set(id,a);project={...project,generationHistory:[...project.generationHistory,c.generation],feedbackLedger:{...project.feedbackLedger,records:[...project.feedbackLedger.records,c.feedback]}};project=updateIteration(project,c.generation.id,{status},{positiveFeedback:['Clear focal separation.'],negativeFeedback:status==='rejected'?['Crop obscures the important structure.']:[],nextChange:'Retain the proportions; reconsider the edge crop.',endorsed:i===0,endorsementScope:i===0?'exemplar_candidate':i===1?'project_specific':'local_exception',notes:'Generic review evidence, not an endorsed Official exemplar.'});
 }return {project,assets};
}
