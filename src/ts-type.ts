export * from './infer-type';
import { inferType, InferTypeOptions, ToTypeStringOptions } from './infer-type';

export type GenTsTypeOptions = InferTypeOptions & ToTypeStringOptions;

export function genTsType(o: any, options: GenTsTypeOptions = {}): string {
  let type = inferType(o, options);
  return type.toString(options);
}
