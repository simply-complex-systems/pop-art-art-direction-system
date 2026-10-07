import { Ajv, type AnySchema, type ValidateFunction } from 'ajv';
export type ContractName = 'application-state' | 'project-state' | 'production-spec' | 'pack'
  | 'preset' | 'feedback-ledger' | 'project-manifest';
export type ContractValidator = (name: ContractName, value: unknown) => void;
/** Inject schemas so contracts stay usable in browser and Node environments. */
export function createContractValidator(documents: Record<string, AnySchema>): ContractValidator {
  const ajv = new Ajv({ allErrors: true, strict: true });
  for (const schema of Object.values(documents)) ajv.addSchema(schema);
  const validators = new Map<ContractName, ValidateFunction>();
  return (name, value) => {
    let validate = validators.get(name);
    if (!validate) {
      validate = ajv.getSchema(`https://pop-art.local/schemas/${name}.schema.json`);
      if (!validate) throw new Error(`Missing contract schema: ${name}`);
      validators.set(name, validate);
    }
    if (!validate(value)) throw new Error(`${name}: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
  };
}
