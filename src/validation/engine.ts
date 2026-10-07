import type {ProjectState,ResolvedPanel} from '../state/types.js';
import {applies} from '../state/integrity.js';
import {evaluateSeparation} from '../color/perception.js';
import type {Advisory} from './advisories.js';
/** Configuration heuristics only. Thresholds are soft, deterministic and documented. */
export function deriveAdvisories(project:ProjectState,panels:readonly ResolvedPanel[]):Advisory[] {
 const records:Advisory[]=[];
 const add=(type:string,category:NonNullable<Advisory['category']>,panelId:string|undefined,ids:string[],message:string,suggestedAction:string,evidence:Record<string,string|number|boolean>)=>records.push({id:`${type}:${panelId??'all'}:${ids.join(':')}`,type,severity:'warning',category,scope:panelId?{kind:'panels',panelIds:[panelId]}:{kind:'all'},involvedIds:ids,message,suggestedAction,evidence});
 if(project.typography.enabled&&project.typography.elements.length>=24)add('text_count','typography',undefined,project.typography.elements.map(e=>e.id),'The configuration has many text devices.','Review the text hierarchy or distribute devices across panels.',{count:project.typography.elements.length,threshold:24});
 for(const panel of panels){const id=panel.panelId;
  for(const e of evaluateSeparation(panel.color,project.color.roles,project.color.relationships,id)){
   const declared=e.reasons.includes('declared_relationship');const separator=e.separators.some(s=>s.strength==='strong')?.78:e.separators.length?.9:1;
   const threshold=(declared?.20:.16)*separator;const bg=e.reasons.includes('figure_background');
   const reason={distance:Number(e.distance.toFixed(4)),lightnessDifference:Number(e.lightnessDifference.toFixed(4)),threshold:Number(threshold.toFixed(4)),relationshipWeight:e.weight,intentionalSeparator:e.separators.length>0};
   if(e.reasons.includes('major_roles')&&e.distance<threshold)add('color_collision','color',id,e.roleIds,'Distinct major roles have weak configured perceptual separation.','Increase hue/value separation, or declare an intentional separator.',reason);
   const roles=e.roleIds.map(r=>project.color.roles.find(x=>x.id===r)!);const labels=roles.map(r=>[r.displayLabel,r.materialLabel].filter(Boolean).join(' / '));
   if(labels.every(Boolean)&&labels[0]!==labels[1]&&e.distance<.09)add('role_collision','color',id,e.roleIds,'Differently labeled roles have nearly indistinguishable configured colors.','Review the semantic/material role colors; intentional similarity is allowed.',reason);
   if(bg&&(e.distance<.20*separator||e.lightnessDifference<.13*separator))add('figure_background_collision','color',id,e.roleIds,'A major subject role has weak separation from a background field.','Consider changing the background value or adding a contour.',reason);
   if(e.distance>=.16&&e.lightnessDifference<.10*separator)add('low_value_separation','color',id,e.roleIds,'Colors differ perceptually but their configured lightness is similar.','Review value contrast, especially where roles meet.',reason);
  }
  const c=panel.composition;const contained=c.cropExtent==='fully-contained'||c.edgeTreatment==='fully-contained'||c.cropExtent==='complete-containment';
  if(contained&&c.subjectPlacement){const clearance=Math.min(c.subjectPlacement.x,1-c.subjectPlacement.x,c.subjectPlacement.y,1-c.subjectPlacement.y);if(clearance<=.06)add('possible_edge_tangency','composition',id,[],'Complete containment is requested with placement very near a frame edge.','Move the declared placement inward or intentionally revise containment.',{placementClearance:clearance,threshold:.06});}
  const clipped=c.cropExtent==='clipped'||c.edgeTreatment==='clipped'||c.edgeTreatment==='intentional-clipping';
  if(contained&&clipped)add('crop_containment_conflict','composition',id,[],'Declared containment and edge clipping instructions conflict.','Clarify the crop and edge treatment.',{cropExtent:c.cropExtent??'',edgeTreatment:c.edgeTreatment??''});
  const t=panel.texture;const aggressive=t.finishes.filter(f=>f.family!=='none'&&f.intensity>=8);
  for(const scope of ['subject','background'] as const){const layer=t[scope];const finishes=aggressive.filter(f=>f.scope===scope||f.scope==='global');const count=finishes.length+(layer.family!=='none'&&layer.intensity>=8?1:0);
   if(count>=3)add('texture_overload','texture',id,[scope],'Several high-intensity texture/finish treatments share this scope.','Reduce one intensity or separate treatment scopes.',{scope,highIntensityLayers:count,threshold:3});
   if(finishes.length>=2)add('print_finish_conflict','texture',id,[scope],'Multiple aggressive finishes overlap in the configured scope.','Review combined finish intensity or separate their scope.',{scope,finishes:finishes.length,threshold:8});
   const intensity=Math.max(layer.intensity,scope==='subject'?panel.sliders.subjectTextureIntensity:panel.sliders.backgroundTextureIntensity);
   if(c.focalRegion&&layer.family!=='none'&&intensity>=9&&!layer.exclusions.some(x=>x===c.focalRegion||x==='focal region'))add('focal_readability_risk','texture',id,[scope],'Very high texture intensity has no declared exclusion for the focal region.','Consider protecting the declared focal region with an exclusion.',{scope,intensity,focalRegion:c.focalRegion,threshold:9});
  }
  const text=project.typography.enabled?project.typography.elements.filter(e=>applies(e.panelScope,id)):[];const props=project.props.elements.filter(e=>applies(e.panelScope,id));const effects=project.effects.elements.filter(e=>applies(e.panelScope,id));
  if(text.length>=8)add('panel_text_density','typography',id,text.map(e=>e.id),'Many text devices are assigned to this panel.','Review their placement and reading order.',{count:text.length,threshold:8});
  if(props.length+effects.length>=10)add('object_density','props',id,[...props,...effects].map(e=>e.id),'Many props/effects are assigned to this panel.','Review visual hierarchy and spread.',{count:props.length+effects.length,threshold:10});
  if(effects.length>=7)add('effect_density','props',id,effects.map(e=>e.id),'Many effects share this panel.','Review effect intensity and targets.',{count:effects.length,threshold:7});
  const groups=new Map<string,string[]>();for(const element of [...text,...props,...effects]){if(!element.placement)continue;groups.set(element.placement,[...(groups.get(element.placement)??[]),element.id]);}
  for(const [placement,ids] of groups)if(ids.length>=4)add('shared_placement','props',id,ids,'Several elements request the same named placement; overlap may need review.','Separate named placements or make the overlap intentional.',{placement,count:ids.length,threshold:4});
  if(panel.sliders.subjectPreservation<=3)add('low_subject_preservation','lighting',id,[],'Low Subject Preservation permits substantial reinterpretation.','Raise preservation if subject continuity matters.',{subjectPreservation:panel.sliders.subjectPreservation,threshold:3});
  if(panel.sliders.subjectAbstraction>=8&&panel.sliders.subjectPreservation<=5)add('identity_risk','lighting',id,[],'Aggressive abstraction with loose preservation may reduce subject recognizability.','Review abstraction against the desired subject continuity.',{subjectAbstraction:panel.sliders.subjectAbstraction,subjectPreservation:panel.sliders.subjectPreservation});
  if(c.technique?.includes('faceless')&&panel.sliders.subjectPreservation<=5)add('faceless_preservation_risk','composition',id,[],'Faceless framing with loose preservation may weaken identifying cues.','Review whether the subject needs identifying features.',{technique:c.technique,subjectPreservation:panel.sliders.subjectPreservation});
 }
 return records;
}
