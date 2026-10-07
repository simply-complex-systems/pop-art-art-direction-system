import type {AnySchema} from 'ajv';
import {createContractValidator} from '../state/schema-validation.js';
export const validate=createContractValidator(import.meta.glob('../../schemas/*.schema.json',{eager:true,import:'default'}) as Record<string,AnySchema>);
