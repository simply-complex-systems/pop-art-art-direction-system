import type { CategorySetting, Choice, Palette, Preset, ProjectState, ProductionSpec,
  VariationRule, ColorVariationRule, ResolvedPanel, ProductionDisplay, ResolvedChoreography } from './types.js';
import { SCHEMA_VERSION } from './types.js';
import { applies, assertPalette, assertProjectIntegrity, assertProductionIntegrity } from './integrity.js';
import type { ContractValidator } from './schema-validation.js';
export interface ResolutionContext {
  validate: ContractValidator;
  /** Optional presentation metadata for the shared export snapshot; legacy resolution stays byte-compatible. */
  includeChoreography?:boolean;
  display?:ProductionDisplay;
  presets: Preset[];
  /** Concrete selections supplied by a later randomization engine. Keys are stable resolution paths. */
  randomDecisions: Record<string, unknown>;
  availableColorStrategies: { packId: string; strategyId: string }[];
}
function choose<T>(choice: Choice<T>, category: Preset['category'], key: string, ctx: ResolutionContext): T {
  switch (choice.kind) {
    case 'literal': return choice.value;
    case 'preset': {
      const preset = ctx.presets.find(p => p.id === choice.reference.presetId);
      if (!preset || preset.category !== category || preset.provenance !== choice.reference.provenance)
        throw new Error(`Missing or incompatible preset at ${key}`);
      ctx.validate('preset', preset);
      return preset.value as T;
    }
    case 'random': {
      if (!Object.hasOwn(ctx.randomDecisions, key)) throw new Error(`Unresolved random choice: ${key}`);
      const value = ctx.randomDecisions[key];
      if (!choice.candidates.some(c => equal(c, value))) throw new Error(`Random decision outside candidates: ${key}`);
      return value as T;
    }
  }
}
/** Object key order is irrelevant to a concrete decision. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'undefined';
}
function equal(a: unknown, b: unknown): boolean { return canonical(a) === canonical(b); }
function structuredIndex(pattern: string, i: number, count: number, length: number): number {
  switch (pattern) {
    case 'alternation': return i % Math.min(2, length);
    case 'paired_echo': return Math.floor(i / 2) % length;
    case 'inversion': return length - 1 - i % length;
    case 'progression': case 'escalation': case 'progressive_shift':
      return count === 1 ? 0 : Math.round(i * (length - 1) / (count - 1));
    case 'controlled_sequence':
      if (i >= length) throw new Error('Controlled sequence needs one concrete entry per panel');
      return i;
    default: return i % length;
  }
}
function vary<T>(rule: VariationRule<T> | ColorVariationRule, global: T, category: Preset['category'],
  panelId: string, i: number, count: number, ctx: ResolutionContext): T {
  switch (rule.mode) {
    case 'uniform': return global;
    case 'structured': {
      if (rule.pattern === 'controlled_sequence' && rule.sequence.length !== count)
        throw new Error('Controlled sequence needs one concrete entry per panel');
      return rule.sequence[structuredIndex(rule.pattern, i, count, rule.sequence.length)] as T;
    }
    case 'random': return choose({ kind: 'random', candidates: rule.candidates as T[] }, category,
      `${category}.variation.${panelId}`, ctx);
    case 'manual': {
      const value = rule.perPanel[panelId];
      return !value || value.kind === 'inherit' ? global : choose(value as Choice<T>, category,
        `${category}.variation.${panelId}`, ctx);
    }
  }
}
function resolveCategory<T>(setting: CategorySetting<T>, category: Preset['category'],
  state: ProjectState, ctx: ResolutionContext): T[] {
  const global = choose(setting.global, category, `${category}.global`, ctx);
  return state.canvas.panels.map((panel, i) => {
    const override = setting.perPanel[panel.id];
    if (override) return override.kind === 'inherit' ? global : choose(override, category,
      `${category}.perPanel.${panel.id}`, ctx);
    return vary(setting.variation, global, category, panel.id, i, state.canvas.panels.length, ctx);
  });
}
function resolveColor(state: ProjectState, ctx: ResolutionContext): Palette[] {
  const color = state.color;
  if (color.strategy.kind === 'pack') {
    const strategy = color.strategy;
    if (!ctx.availableColorStrategies.some(s => s.packId === strategy.packId && s.strategyId === strategy.strategyId))
      throw new Error('Unavailable pack color strategy');
  }
  const global = choose(color.global, 'color', 'color.global', ctx);
  assertPalette(global, color.roles);
  return state.canvas.panels.map((p,i) => {
    const override = color.perPanel[p.id];
    let palette = override ? (override.kind === 'inherit' ? global : choose(override, 'color',
      `color.perPanel.${p.id}`, ctx)) : vary<Palette>(color.variation, global, 'color', p.id, i,
        state.canvas.panels.length, ctx);
    assertPalette(palette, color.roles, p.id);
    palette = { ...palette, assignments: palette.assignments.filter(a => applies(color.roles.find(r => r.id === a.roleId)!.panelScope, p.id)) };
    // Explicit override/manual selections always win; role rotation preserves backgrounds and minor accents.
    if (!override && color.variation.mode === 'structured' && color.variation.pattern === 'role_rotation') {
      const eligible = palette.assignments.filter(a => {
        const r = color.roles.find(r => r.id === a.roleId)!;
        return r.importance === 'major' && r.domain !== 'background';
      });
      palette = { ...palette, assignments: palette.assignments.map(a => {
        const idx = eligible.findIndex(e => e.roleId === a.roleId);
        return idx < 0 ? a : { ...a, color: eligible[(idx + i) % eligible.length]!.color };
      }) };
    }
    return palette;
  });
}
function committedContext(state:ProjectState,ctx:ResolutionContext):ResolutionContext {return {...ctx,randomDecisions:{...ctx.randomDecisions,...state.randomDecisions}};}
/** Shared concrete treatment resolution also works before Subject/Theme are established. */
export function resolveArtDirection(state:ProjectState,ctx:ResolutionContext):ResolvedPanel[] {
  ctx=committedContext(state,ctx);ctx.validate('project-state',state);assertProjectIntegrity(state);
  if(new Set(ctx.presets.map(p=>p.id)).size!==ctx.presets.length)throw new Error('Duplicate preset ID in resolver registry');
  const composition = resolveCategory(state.composition, 'composition', state, ctx);
  const color = resolveColor(state, ctx);
  const texture = resolveCategory(state.texture, 'texture', state, ctx);
  const lightingRendering = resolveCategory(state.lightingRendering, 'lightingRendering', state, ctx);
  const sliders = resolveCategory(state.sliders, 'sliders', state, ctx);
  return structuredClone(state.canvas.panels.map((p,i)=>({panelId:p.id,composition:composition[i]!,color:color[i]!,texture:texture[i]!,lightingRendering:lightingRendering[i]!,sliders:sliders[i]!})));
}
export function resolveProduction(state:ProjectState,ctx:ResolutionContext):ProductionSpec {
  const panels=resolveArtDirection(state,ctx);
  if(!state.subject||!state.theme)throw new Error('Production requires established Subject and Theme references');
  const spec: ProductionSpec = {
    schemaVersion: SCHEMA_VERSION, project: state.project, subject: state.subject, theme: state.theme,
    canvas: state.canvas, color: { strategy: state.color.strategy, roles: state.color.roles,
      relationships: state.color.relationships },
    panels,
    ...(ctx.includeChoreography?{choreography:Object.fromEntries((['composition','color','texture','lightingRendering','sliders'] as const).map(category=>{
      const setting=state[category];const rule=setting.variation;
      const panelSources=state.canvas.panels.map(panel=>{const override=setting.perPanel[panel.id];const manual=rule.mode==='manual'?rule.perPanel[panel.id]:undefined;
        const source:ResolvedChoreography['panelSources'][number]['source']=override?(override.kind==='inherit'?'global':'override'):rule.mode==='manual'?(manual&&manual.kind!=='inherit'?'manual':'global'):rule.mode==='structured'?'structured':rule.mode==='random'?'committed_random':'global';
        return {panelId:panel.id,source};});
      return [category,{mode:rule.mode,...(rule.mode==='structured'?{pattern:rule.pattern}:{}),panelSources}];
    })) as NonNullable<ProductionSpec['choreography']>}:{ }),
    ...(ctx.display?{display:ctx.display}:{}),
    categoryInstructions: { composition: state.composition.additionalInstructions, color: state.color.additionalInstructions,
      texture: state.texture.additionalInstructions, lightingRendering: state.lightingRendering.additionalInstructions,
      sliders: state.sliders.additionalInstructions, typography: state.typography.additionalInstructions,
      props: state.props.additionalInstructions, effects: state.effects.additionalInstructions,
      ...(state.exemplarInstructions!==undefined?{exemplars:state.exemplarInstructions}:{}) },
    typography: state.typography, props: state.props, effects: state.effects, exemplars: state.exemplars,
  };
  if(spec.display){const used=new Set<string>();const visit=(value:unknown):void=>{if(typeof value==='string')used.add(value);else if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')Object.values(value).forEach(visit);};visit({...spec,display:undefined});spec.display={...spec.display,terms:Object.fromEntries(Object.entries(spec.display.terms).filter(([value])=>used.has(value)))};}
  ctx.validate('production-spec', spec);
  assertProductionIntegrity(spec);
  return structuredClone(spec); // Snapshot has no shared references to editable state.
}
