import type { AnySchema } from 'ajv';
import { loadLibrary } from './registry.js';
const schemas = import.meta.glob('../../schemas/*.schema.json', {eager: true, import: 'default'}) as Record<string, AnySchema>;
export function loadInstalledOfficialLibrary() {
  return loadLibrary({baseUrl: new URL(import.meta.env.BASE_URL, window.location.origin).href, schemas,
    source: 'curated_registry', readJson: async url => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Library request failed: ${response.status} ${url}`);
      return response.json() as Promise<unknown>;
    }});
}
