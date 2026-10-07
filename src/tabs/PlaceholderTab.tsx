import {TABS,type TabId} from '../app/tabs.js';
export function PlaceholderTab({tab}:{tab:TabId}) {
  const info=TABS.find(t=>t.id===tab)!;
  return <section className="tab-placeholder"><h3>{info.label} workspace</h3>
    <p>Controls arrive in Phase {info.phase}.</p>
    <p className="muted">Your project context and canvas remain available in the summary above.</p></section>;
}
