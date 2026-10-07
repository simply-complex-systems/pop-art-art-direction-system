import type { PackManifest } from './types.js';
/** Curated trust comes from the application's registry, never from an imported JSON claim. */
export function classifyPack(manifest: PackManifest, source: 'community_import' | 'curated_registry'): PackManifest {
  const result = structuredClone(manifest);
  result.provenance = source === 'curated_registry' ? 'official' : 'community';
  result.exemplars.forEach(e => { e.provenance = result.provenance; });
  result.presets.forEach(p => { p.provenance = result.provenance; });
  return result;
}
