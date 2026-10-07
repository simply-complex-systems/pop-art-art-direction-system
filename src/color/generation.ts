import type {ColorRole,ColorRelationship,Palette,ColorStrategy,PackColorStrategy} from '../state/types.js';
import {evaluateSeparation,hexToOKLab} from './perception.js';
import {applies} from '../state/integrity.js';
export type Entropy=()=>number;
export const PALETTE_SEARCH_BUDGET=64;
/** Small gamut-clipped OKLCH utility for graphic palette construction; stored output remains #RRGGBB. */
export function oklchToHex(l:number,c:number,h:number):string {
 const a=c*Math.cos(h*Math.PI/180),b=c*Math.sin(h*Math.PI/180);
 const ll=(l+.3963377774*a+.2158037573*b)**3,mm=(l-.1055613458*a-.0638541728*b)**3,ss=(l-.0894841775*a-1.291485548*b)**3;
 const rgb=[4.0767416621*ll-3.3077115913*mm+.2309699292*ss,-1.2684380046*ll+2.6097574011*mm-.3413193965*ss,-.0041960863*ll-.7034186147*mm+1.707614701*ss];
 return '#'+rgb.map(n=>{const x=n<=.0031308?12.92*n:1.055*Math.max(0,n)**(1/2.4)-.055;return Math.round(Math.max(0,Math.min(1,x))*255).toString(16).padStart(2,'0');}).join('').toUpperCase();
}
export function paletteScore(palette:Palette,roles:ColorRole[],relations:ColorRelationship[],panels:readonly string[]):number {
 let score=0,worst=1;for(const panel of panels)for(const pair of evaluateSeparation(palette,roles,relations,panel)){
  const separator=pair.separators.some(s=>s.strength==='strong')?.78:pair.separators.length?.9:1;
  const distanceTarget=.23*separator;const valueTarget=pair.reasons.includes('figure_background')?.22:.12;
  const d=Math.min(1,pair.distance/distanceTarget),v=Math.min(1,pair.lightnessDifference/valueTarget);
  score+=pair.weight*(d+.45*v-5*Math.max(0,1-d)**2);worst=Math.min(worst,d);
 }return score+4*worst;
}
function offsets(id:string):number[] {switch(id){case 'complementary':return [0,180];case 'split_complementary':return [0,150,210];case 'triadic':return [0,120,240];case 'analogous':return [0,25,50];case 'monochromatic':return [0];default:return [0,137.5,275,52.5];}}
/** Entropy constructs a bounded bank; deterministic scoring chooses its winner. No rendering or artist-color repair. */
export function generatePalette(roles:ColorRole[],relations:ColorRelationship[],panels:readonly string[],strategy:ColorStrategy,current:Palette,entropy:Entropy=Math.random,definition?:PackColorStrategy):Palette {
 const id=definition?.basis??(strategy.kind==='builtin'?strategy.id:strategy.strategyId);
 if(id==='custom'){if(!current.assignments.length)throw new Error('Custom requires concrete inputs');return structuredClone(current);}
 const relevant=roles.filter(role=>panels.some(id=>applies(role.panelScope,id)));const major=relevant.filter(r=>r.importance==='major'&&r.domain!=='background');const hues=definition?.hueOffsets.length?definition.hueOffsets:offsets(id);
 let best:Palette|undefined,bestScore=-Infinity;
 for(let attempt=0;attempt<PALETTE_SEARCH_BUDGET;attempt++){
  const base=entropy()*360;const lightBackground=attempt%4!==3;const start=entropy();
  const assignments=roles.map(role=>{
   if(role.domain==='background')return {roleId:role.id,color:oklchToHex(lightBackground?.91+entropy()*.07:.12+entropy()*.1,.01+entropy()*.035,base+180)};
   const index=major.findIndex(r=>r.id===role.id);const i=index<0?Math.floor(entropy()*Math.max(1,major.length)):index;
   const hue=base+hues[i%hues.length]!;const l=.25+((start+i*.31+attempt*.13)%1)*.5;
   return {roleId:role.id,color:oklchToHex(l,id==='monochromatic'?.08+entropy()*.06:.12+entropy()*.08,hue)};
  });for(const role of roles.filter(r=>r.importance==='minor'&&r.domain!=='background')){const repeated=assignments.find(a=>a.roleId===major[0]?.id);const target=assignments.find(a=>a.roleId===role.id);if(repeated&&target&&!relations.some(r=>r.roleIds.includes(role.id)))target.color=repeated.color;}const candidate:Palette={...current,assignments};const score=paletteScore(candidate,roles,relations,panels);if(score>bestScore){best=candidate;bestScore=score;}
 }return best!;
}
export function shiftPalette(palette:Palette,amount:number):Palette {return {...palette,assignments:palette.assignments.map(a=>{const lab=hexToOKLab(a.color);const h=(Math.atan2(lab.b,lab.a)*180/Math.PI+360)%360;return {...a,color:oklchToHex(Math.max(.08,Math.min(.98,lab.l+amount)),Math.hypot(lab.a,lab.b),h)};})};}
