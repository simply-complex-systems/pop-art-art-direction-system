import type { ColorRelationship, ColorRole, HexColor, Palette } from '../state/types.js';
import { applies } from '../state/integrity.js';
export interface OKLab { l: number; a: number; b: number }
export interface OKLCH { l: number; c: number; h: number }
function linear(n: number): number { return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; }
export function hexToOKLab(hex: HexColor): OKLab {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Invalid concrete color: ${hex}`);
  const r = linear(parseInt(hex.slice(1,3),16) / 255);
  const g = linear(parseInt(hex.slice(3,5),16) / 255);
  const b = linear(parseInt(hex.slice(5,7),16) / 255);
  const l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  const m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  const s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  return { l: 0.2104542553*l + 0.793617785*m - 0.0040720468*s,
    a: 1.9779984951*l - 2.428592205*m + 0.4505937099*s,
    b: 0.0259040371*l + 0.7827717662*m - 0.808675766*s };
}
export function labToLCH(lab: OKLab): OKLCH {
  const c = Math.hypot(lab.a,lab.b);
  return { l: lab.l, c, h: c < 1e-7 ? 0 : (Math.atan2(lab.b,lab.a)*180/Math.PI+360)%360 };
}
export function perceptualDistance(a: HexColor, b: HexColor): number {
  const x = hexToOKLab(a), y = hexToOKLab(b);
  return Math.hypot(x.l-y.l,x.a-y.a,x.b-y.b);
}
export interface SeparationPair {
  roleIds: [string,string];
  reasons: ('major_roles' | 'figure_background' | 'declared_relationship')[];
  weight: number;
  separators: ColorRelationship['separators'];
}
/** Baseline separation requires no adjacency metadata. Backgrounds compare to every major subject role. */
export function separationPairs(roles: ColorRole[], relationships: ColorRelationship[], panelId: string): SeparationPair[] {
  const active = roles.filter(r => applies(r.panelScope,panelId));
  const result: SeparationPair[] = [];
  for (let i=0;i<active.length;i++) for (let j=i+1;j<active.length;j++) {
    const a=active[i]!, b=active[j]!;
    const reasons: SeparationPair['reasons'] = [];
    if (a.importance==='major' && b.importance==='major') reasons.push('major_roles');
    const figureBackground = (a.domain==='background' && b.domain==='subject' && b.importance==='major')
      || (b.domain==='background' && a.domain==='subject' && a.importance==='major');
    if (figureBackground) reasons.push('figure_background');
    const relations = relationships.filter(r => applies(r.panelScope,panelId)
      && r.roleIds.includes(a.id) && r.roleIds.includes(b.id));
    if (relations.length) reasons.push('declared_relationship');
    if (!reasons.length) continue;
    result.push({ roleIds:[a.id,b.id], reasons,
      weight: (figureBackground ? 2 : 1) * (relations.length ? 2 : 1),
      separators: relations.flatMap(r => r.separators) });
  }
  return result;
}
export interface SeparationEvidence extends SeparationPair {
  distance: number; lightnessDifference: number; chromaDifference: number;
}
/** Evidence only: it never changes artist colors or blocks production. Threshold advisories arrive in Phase 6. */
export function evaluateSeparation(palette: Palette, roles: ColorRole[], relationships: ColorRelationship[],
  panelId: string): SeparationEvidence[] {
  const colors = new Map(palette.assignments.map(a=>[a.roleId,a.color]));
  return separationPairs(roles,relationships,panelId).map(pair => {
    const a=colors.get(pair.roleIds[0]),b=colors.get(pair.roleIds[1]);
    if (!a || !b) throw new Error('Separation evidence requires concrete role colors');
    const x=labToLCH(hexToOKLab(a)),y=labToLCH(hexToOKLab(b));
    return {...pair,distance:perceptualDistance(a,b),lightnessDifference:Math.abs(x.l-y.l),
      chromaDifference:Math.abs(x.c-y.c)};
  });
}
