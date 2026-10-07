import type { Canvas, ColorRole, Palette, PanelScope, ProjectState, ProductionSpec } from './types.js';
function unique(ids: string[], label: string): void {
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${label} ID`);
}
export function applies(scope: PanelScope, panelId: string): boolean {
  return scope.kind === 'all' || scope.panelIds.includes(panelId);
}
function assertCanvas(canvas: Canvas): Set<string> {
  unique(canvas.panels.map(p => p.id), 'panel');
  const cells = new Set<string>();
  for (const p of canvas.panels) {
    if (p.row + p.rowSpan > canvas.grid.rows || p.column + p.columnSpan > canvas.grid.columns)
      throw new Error(`Panel ${p.id} lies outside grid`);
    for (let r = p.row; r < p.row + p.rowSpan; r++) for (let c = p.column; c < p.column + p.columnSpan; c++) {
      const cell = `${r}:${c}`;
      if (cells.has(cell)) throw new Error(`Panels overlap at ${cell}`);
      cells.add(cell);
    }
  }
  return new Set(canvas.panels.map(p => p.id));
}
/** Validate cross-references that JSON Schema cannot express. */
function assertScopes(value: unknown, panelIds: Set<string>): void {
  if (Array.isArray(value)) { value.forEach(v => assertScopes(v, panelIds)); return; }
  if (!value || typeof value !== 'object') return;
  const object = value as Record<string, unknown>;
  if (object['kind'] === 'panels') for (const id of object['panelIds'] as string[]) {
    if (!panelIds.has(id)) throw new Error(`Unknown panel scope: ${id}`);
  }
  if (object['perPanel']) for (const id of Object.keys(object['perPanel'] as object)) {
    if (!panelIds.has(id)) throw new Error(`Unknown panel override: ${id}`);
  }
  Object.values(object).forEach(v => assertScopes(v, panelIds));
}
export function assertPalette(palette: Palette, roles: ColorRole[], panelId?: string): void {
  unique(palette.assignments.map(a => a.roleId), 'color assignment');
  const known = new Set(roles.map(r => r.id));
  for (const a of palette.assignments) if (!known.has(a.roleId)) throw new Error(`Unknown color role: ${a.roleId}`);
  const relevant = panelId ? roles.filter(r => applies(r.panelScope, panelId)) : roles;
  for (const r of relevant) if (!palette.assignments.some(a => a.roleId === r.id))
    throw new Error(`Missing color assignment: ${r.id}`);
}
function assertColor(color: ProjectState['color'] | ProductionSpec['color'], panels: Set<string>): void {
  unique(color.roles.map(r => r.id), 'color role');
  const roleMap = new Map(color.roles.map(r => [r.id, r]));
  for (const id of panels) {
    if (!color.roles.some(r => r.domain === 'background' && applies(r.panelScope, id)))
      throw new Error(`No background role for panel ${id}`);
  }
  for (const relation of color.relationships) {
    const [a,b] = relation.roleIds.map(id => roleMap.get(id));
    if (!a || !b) throw new Error('Relationship references an unknown role');
    for (const id of panels) if (applies(relation.panelScope, id)
      && (!applies(a.panelScope, id) || !applies(b.panelScope, id)))
      throw new Error(`Relationship uses inactive role in panel ${id}`);
  }
}
function checkEmbeddedPalettes(value: unknown, roles: ColorRole[], panelId?: string): void {
  if (Array.isArray(value)) { value.forEach(v => checkEmbeddedPalettes(v, roles, panelId)); return; }
  if (!value || typeof value !== 'object') return;
  const o = value as Record<string, unknown>;
  if (o['assignments']) assertPalette(o as unknown as Palette, roles, panelId);
  else for (const [key, child] of Object.entries(o)) {
    if (key === 'perPanel') for (const [id, entry] of Object.entries(child as Record<string, unknown>))
      checkEmbeddedPalettes(entry, roles, id);
    else checkEmbeddedPalettes(child, roles, panelId);
  }
}
export function assertProjectIntegrity(state: ProjectState): void {
  const panels = assertCanvas(state.canvas);
  assertScopes(state, panels);
  assertColor(state.color, panels);
  checkEmbeddedPalettes(state.color, state.color.roles);
  for (const [label, entries] of Object.entries({ typography: state.typography.elements,
    props: state.props.elements, effects: state.effects.elements, exemplars: state.exemplars,
    generations: state.generationHistory, feedback: state.feedbackLedger.records })) {
    unique(entries.map(e => e.id), label);
  }
}
export function assertProductionIntegrity(spec: ProductionSpec): void {
  const panels = assertCanvas(spec.canvas);
  assertScopes(spec, panels);
  assertColor(spec.color, panels);
  unique(spec.panels.map(p => p.panelId), 'resolved panel');
  if (spec.panels.length !== panels.size || spec.panels.some(p => !panels.has(p.panelId)))
    throw new Error('Resolved panel set does not match canvas');
  if(spec.choreography)for(const rule of Object.values(spec.choreography)) {
    unique(rule.panelSources.map(p=>p.panelId),'choreography panel');
    if(rule.panelSources.length!==panels.size||rule.panelSources.some(p=>!panels.has(p.panelId)))throw new Error('Choreography panel set does not match canvas');
  }
  for (const p of spec.panels) {
    assertPalette(p.color, spec.color.roles, p.panelId);
    for (const a of p.color.assignments) {
      const role = spec.color.roles.find(r => r.id === a.roleId)!;
      if (!applies(role.panelScope, p.panelId)) throw new Error(`Inactive color role: ${role.id}`);
    }
  }
}
