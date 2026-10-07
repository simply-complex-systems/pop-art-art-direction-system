import type {LibraryRegistry} from '../pack-loader/types.js';
import type {Preset} from '../state/types.js';
import type {ContractValidator} from '../state/schema-validation.js';
import type {ResolutionContext} from '../state/resolve-production.js';
export function resolutionContext(registry:LibraryRegistry|undefined,users:readonly Preset[],validate:ContractValidator):ResolutionContext {return {validate,presets:[...(registry?[...registry.presets.values()].map(p=>p.value):[]),...users],randomDecisions:{},availableColorStrategies:registry?[...registry.packs.values()].flatMap(p=>(p.colorStrategies??[]).map(s=>({packId:p.packId,strategyId:s.id}))):[]};}
