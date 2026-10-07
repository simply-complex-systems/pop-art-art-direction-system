import type {PanelScope} from '../state/types.js';
import type {TabId} from '../app/tabs.js';
/** Derived configuration guidance. Structural contract failures remain separate. */
export interface Advisory {id:string;severity:'info'|'warning';message:string;category?:TabId;type?:string;scope?:PanelScope;involvedIds?:string[];suggestedAction?:string;evidence?:Record<string,string|number|boolean>}
export function advisorySummary(records:readonly Advisory[]):string {
  const warnings=records.filter(r=>r.severity==='warning').length;const info=records.length-warnings;
  if(!records.length)return 'No advisories';
  return [warnings?`${warnings} ${warnings===1?'warning':'warnings'}`:'',info?`${info} informational`:''].filter(Boolean).join(' · ');
}
