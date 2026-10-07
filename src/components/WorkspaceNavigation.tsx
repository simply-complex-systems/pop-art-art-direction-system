import {TABS,nextTab,type TabId} from '../app/tabs.js';
export function WorkspaceNavigation({activeTab,onSelect}:{activeTab:TabId;onSelect:(tab:TabId)=>void}) {
  return <nav className="workspace-navigation" aria-label="Art Director categories">
    <h2 className="section-label">Art Director</h2>
    <div role="tablist" aria-label="Workspace categories" aria-orientation="vertical">
      {TABS.map(t=><button key={t.id} id={`tab-${t.id}`} role="tab" type="button" aria-selected={activeTab===t.id}
        aria-controls={`panel-${t.id}`} tabIndex={activeTab===t.id?0:-1} onClick={()=>onSelect(t.id)}
        onKeyDown={event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
          event.preventDefault();const id=nextTab(t.id,event.key);onSelect(id);document.getElementById(`tab-${id}`)?.focus();
        }}}>{t.label}</button>)}
    </div>
  </nav>;
}
