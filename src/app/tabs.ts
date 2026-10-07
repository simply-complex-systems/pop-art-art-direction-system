export const TABS = [
  {id:'canvas',label:'Canvas & Layout',phase:5}, {id:'composition',label:'Composition',phase:5},
  {id:'color',label:'Color',phase:5}, {id:'texture',label:'Texture & Print',phase:5},
  {id:'lighting',label:'Lighting & Rendering',phase:5}, {id:'typography',label:'Typography',phase:5},
  {id:'props',label:'Props & Effects',phase:5}, {id:'exemplars',label:'Exemplars',phase:5},
  {id:'presets',label:'Presets',phase:6}, {id:'project',label:'Project',phase:8},
  {id:'export',label:'Export',phase:7},
] as const;
export type TabId = typeof TABS[number]['id'];
export const TAB_STORAGE_KEY = 'pop-art.ui.tab.v1';
export function isTab(value: string): value is TabId {return TABS.some(t=>t.id===value);}
export function readTab(storage?: {getItem(key:string):string|null}): TabId {
  try {const value=storage?.getItem(TAB_STORAGE_KEY); return value && isTab(value)?value:'canvas';} catch {return 'canvas';}
}
export function nextTab(current:TabId,key:string):TabId {
  const index=TABS.findIndex(t=>t.id===current);
  if(key==='Home')return TABS[0].id;if(key==='End')return TABS[TABS.length-1]!.id;
  if(key==='ArrowDown')return TABS[(index+1)%TABS.length]!.id;
  if(key==='ArrowUp')return TABS[(index-1+TABS.length)%TABS.length]!.id;
  return current;
}
