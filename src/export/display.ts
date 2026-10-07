import type {ProjectState,ProductionDisplay} from '../state/types.js';
import type {LibraryRegistry} from '../pack-loader/types.js';
import {currentLayout} from '../app/layouts.js';
/** Presentation labels, not artistic decisions; the resolver filters them to actual snapshot terms. */
export function productionDisplay(project:ProjectState,registry?:LibraryRegistry):ProductionDisplay {
 const terms:Record<string,string>={};if(registry){for(const registered of registry.options.values()){terms[registered.value.id]=registered.value.label;if(typeof registered.value.value==='string')terms[registered.value.value]=registered.value.label;}for(const pack of registry.packs.values())for(const strategy of pack.colorStrategies)terms[strategy.id]=strategy.label;}
 return {layoutName:currentLayout(project.canvas)?.name??'Custom panel layout',terms};
}
