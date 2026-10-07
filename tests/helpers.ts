import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AnySchema } from 'ajv';
import { createContractValidator } from '../src/state/schema-validation.js';
import type { ProjectState } from '../src/state/types.js';
export const validate = createContractValidator(Object.fromEntries(readdirSync('schemas')
  .filter(n => n.endsWith('.schema.json')).map(n => [n, JSON.parse(readFileSync(resolve('schemas',n),'utf8')) as AnySchema])));
export function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(resolve('tests/fixtures',`${name}.json`),'utf8')) as T;
}
export function project(): ProjectState { return fixture<ProjectState>('project-state.valid'); }
