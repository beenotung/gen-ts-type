export * from './infer-type';
import { inferType, InferTypeOptions, ToTypeStringOptions } from './infer-type';

export type GenTsTypeOptions = InferTypeOptions &
  ToTypeStringOptions & {
    name?: string;
    export?: boolean;
  };

export function genTsType(o: any, options: GenTsTypeOptions = {}): string {
  let type = inferType(o, options).toString(options);
  if (options.name) {
    type = `type ${options.name} = ${type}`;
    if (options.export) {
      type = `export ${type}`;
    }
  }
  return type;
}
