import type { ProjectState, ProductionSpec } from './types.js';
import type { ContractValidator } from './schema-validation.js';
import { assertProjectIntegrity, assertProductionIntegrity } from './integrity.js';
export function serializeProject(state: ProjectState, validate: ContractValidator): string {
  validate('project-state', state);
  assertProjectIntegrity(state);
  return JSON.stringify(state, null, 2);
}
export function deserializeProject(json: string, validate: ContractValidator): ProjectState {
  const value: unknown = JSON.parse(json);
  validate('project-state', value);
  const state = value as ProjectState;
  assertProjectIntegrity(state);
  return state;
}
export function serializeProduction(spec: ProductionSpec, validate: ContractValidator): string {
  validate('production-spec', spec);
  assertProductionIntegrity(spec);
  return JSON.stringify(spec, null, 2);
}
export function deserializeProduction(json: string, validate: ContractValidator): ProductionSpec {
  const value: unknown = JSON.parse(json);
  validate('production-spec', value);
  const spec = value as ProductionSpec;
  assertProductionIntegrity(spec);
  return spec;
}
