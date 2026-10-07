import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { AnySchema } from 'ajv';
import { createContractValidator } from '../src/state/schema-validation.js';
import type { PackManifest, Provenance } from '../src/state/types.js';

export interface PackValidationResult { path: string; source: Provenance | 'fixture'; valid: boolean; error?: string }
function manifests(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return manifests(path);
    return entry.isFile() && entry.name === 'manifest.json' ? [path] : [];
  }).sort();
}
/** Validation only: this does not migrate manifests, copy assets or register application content. */
export function validatePacks(root: string): PackValidationResult[] {
  const schemas = Object.fromEntries(readdirSync(resolve(root, 'schemas'))
    .filter(name => name.endsWith('.schema.json')).map(name => [name,
      JSON.parse(readFileSync(resolve(root, 'schemas', name), 'utf8')) as AnySchema]));
  const validate = createContractValidator(schemas);
  const inputs: { path: string; source: PackValidationResult['source'] }[] = [
    { path: resolve(root, 'tests/fixtures/pack.valid.json'), source: 'fixture' },
    ...(['official', 'community'] as const).flatMap(source =>
      manifests(resolve(root, 'packs', source)).map(path => ({ path, source }))),
  ];
  return inputs.map(({ path, source }) => {
    try {
      const value: unknown = JSON.parse(readFileSync(path, 'utf8'));
      validate('pack', value);
      const pack = value as PackManifest;
      if (source !== 'fixture' && pack.provenance !== source) {
        throw new Error(`Expected ${source} provenance in packs/${source}`);
      }
      return { path, source, valid: true };
    } catch (error) {
      return { path, source, valid: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}
