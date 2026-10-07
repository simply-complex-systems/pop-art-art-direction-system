/** Generic visual/contract review data, excluded from the shipped application. */
import {phase5Project} from './phase5-data.js';
export function phase6Project(kind='default') {
 const p=phase5Project(kind==='color-advisories'||kind==='texture-advisories'||kind==='density'?1:4);
 p.exemplars=[{id:'reference-a',name:'Artist reference',role:'production reference',asset:{id:'asset-a',path:'project-assets/reference.png',mediaType:'image/png',sha256:'a'.repeat(64)},panelScope:{kind:'all'},transfer:['declared structure'],doNotTransfer:['subject identity'],notes:'Preserve this artist-authored reference note.'}];
 if(kind==='color-advisories'&&p.color.global.kind==='literal')p.color.global.value.assignments.forEach(a=>a.color='#777777');
 if(kind==='texture-advisories'&&p.texture.global.kind==='literal'){p.texture.global.value.subject.intensity=10;p.texture.global.value.subject.exclusions=[];p.texture.global.value.finishes=[{scope:'subject',family:'screenprint-grain',intensity:9,additionalInstructions:'First artist finish note.'},{scope:'global',family:'misregistration',intensity:9,additionalInstructions:'Second artist finish note.'}];}
 if(kind==='density'){p.typography.elements=Array.from({length:25},(_,i)=>({...p.typography.elements[0]!,id:`text-${i}`,content:`Artist caption ${i+1}`}));p.effects.elements=Array.from({length:12},(_,i)=>({...p.effects.elements[0]!,id:`effect-${i}`}));}
 if(kind==='structured'&&p.color.global.kind==='literal')p.color.variation={mode:'structured',pattern:'role_rotation',sequence:Array.from({length:4},()=>structuredClone(p.color.global.kind==='literal'?p.color.global.value:{assignments:[]}))};
 return p;
}
