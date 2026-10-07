import type {CategorySetting,Choice,OverrideChoice,VariationRule,ColorState,Palette,ColorVariationRule,StructuredPattern,ColorPattern} from '../state/types.js';
export type EditableVariation<T> = {mode:'uniform'}|{mode:'structured';pattern:StructuredPattern|ColorPattern;sequence:T[]}|{mode:'random';candidates:T[]}|{mode:'manual';perPanel:Record<string,OverrideChoice<T>>};
export type EditableSetting<T> = {global:Choice<T>;perPanel:Record<string,OverrideChoice<T>>;variation:EditableVariation<T>;additionalInstructions:string};
export function literalValue<T>(setting:EditableSetting<T>,panelId?:string):T|undefined {
  const entry=panelId?(setting.perPanel[panelId]??(setting.variation.mode==='manual'?setting.variation.perPanel[panelId]:undefined)):setting.global;
  if(entry?.kind==='literal')return entry.value as T;
  if(!entry||entry.kind==='inherit')return setting.global.kind==='literal'?setting.global.value:undefined;
  return undefined;
}
export function isOverridden<T>(setting:EditableSetting<T>,panelId:string):boolean {
  const entry=setting.perPanel[panelId]??(setting.variation.mode==='manual'?setting.variation.perPanel[panelId]:undefined);
  return !!entry&&entry.kind!=='inherit';
}
export function editTarget<T,S extends EditableSetting<T>>(setting:S,target:string,value:T|undefined):S {
  const entry:OverrideChoice<T>=value===undefined?{kind:'inherit'}:{kind:'literal',value:structuredClone(value)};
  if(target==='global')return value===undefined?setting:{...setting,global:entry};
  if(setting.variation.mode==='manual') {
    const perPanel={...setting.perPanel};delete perPanel[target];
    return {...setting,perPanel,variation:{...setting.variation,perPanel:{...setting.variation.perPanel,[target]:entry}}};
  }
  const perPanel={...setting.perPanel};if(value===undefined)delete perPanel[target];else perPanel[target]=entry;
  return {...setting,perPanel};
}
export function changeMode<T,S extends EditableSetting<T>>(setting:S,mode:VariationRule<T>['mode'],seed:T,count:number):S {
  if(mode===setting.variation.mode)return setting;
  const variation=mode==='uniform'?{mode} :mode==='manual'?{mode,perPanel:{}}
    :mode==='random'?{mode,candidates:[structuredClone(seed)]}
    :{mode,pattern:'alternation',sequence:Array.from({length:Math.max(2,count)},()=>structuredClone(seed))};
  const perPanel=setting.variation.mode==='manual'?{...setting.variation.perPanel,...setting.perPanel}:setting.perPanel;
  return {...setting,perPanel,variation} as S;
}
export type AnyCategory = CategorySetting<unknown> | ColorState;
