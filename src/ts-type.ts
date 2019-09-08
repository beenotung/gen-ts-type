/* name -> type */
import { genFunctionType } from './function-type';

const typeMap = new Map<string, string>();

export function setTsType(name: string, type: string): void {
  typeMap.set(name, type);
}

/** will rename to genTsType in next major release */
export function genTsType(
  o: any,
  options: {
    /* indentation options */
    format?: boolean;
    currentIndent?: string | '';
    indentStep?: string | '  ';
    /* array options */
    allowEmptyArray?: boolean;
    allowMultiTypedArray?: boolean;
    // only effective to object array
    allowOptionalFieldInArray?: boolean;
  } = {},
): string {
  const type = typeof o;
  switch (type) {
    case 'function':
      return genFunctionType(o);
    case 'string':
      if (typeMap.has(o)) {
        return typeMap.get(o);
      }
      return type;
    case 'number':
    case 'boolean':
    case 'bigint':
    case 'symbol':
    case 'undefined':
      return type;
    case 'object':
      if (o instanceof Date) {
        return 'Date';
      }
      const currentIndent = options.currentIndent || '';
      const indentStep = options.indentStep || '  ';
      const innerIndent = currentIndent + indentStep;
      const nextLevelOption = { ...options, currentIndent: innerIndent };
      if (Array.isArray(o)) {
        if (o.length < 1) {
          if (options.allowEmptyArray) {
            return 'any[]';
          }
          throw new TypeError('cannot determine type of empty array');
        }
        // least 1 element
        if (options.allowOptionalFieldInArray) {
          const nonObjectTypes = new Set<string>();
          const fields = new Map<
            string,
            { types: Set<string>; count: number }
          >();
          for (const x of o) {
            if (
              x &&
              typeof x === 'object' &&
              !(x instanceof Date) &&
              !(x instanceof Map) &&
              !(x instanceof Set)
            ) {
              // really object
              for (const [key, value] of Object.entries(x)) {
                const type = genTsType(value, options);
              }
            } else {
              // not object
              nonObjectTypes.add(genTsType(x, options));
            }
          }
        }
        if (
          options.allowOptionalFieldInArray &&
          o.every(
            x =>
              x &&
              typeof x === 'object' &&
              !(x instanceof Date) &&
              !(x instanceof Map) &&
              !(x instanceof Set),
          )
        ) {
          const fields = new Map<string, number>();
          const total = 0;
        }
        const childTypes = Array.from(
          new Set(o.map(x => genTsType(x, nextLevelOption))),
        );
        if (childTypes.length === 1) {
          return `Array<${genTsType(o[0], options)}>`;
        }
        if (options.allowMultiTypedArray) {
          return `Array<${childTypes.join(' | ')}>`;
        }
        console.error('array of different types, childTypes:', childTypes);
        throw new Error('array of different types');
      }
      // TODO set, map
      // really object
      if (options.format) {
        let res = '{';
        Object.entries(o).forEach(([k, v]) => {
          res += `\n${innerIndent}${JSON.stringify(k)}: ${genTsType(
            v,
            nextLevelOption,
          )};`;
        });
        res += '\n' + currentIndent + '}';
        return res;
      }
      return `{ ${Object.entries(o)
        .map(([k, v]) => `${JSON.stringify(k)}: ${genTsType(v, options)}`)
        .join('; ')} }`;
    default:
      console.error('unknown type', { type, o });
      throw new TypeError('unknown type: ' + type);
  }
}

/** @deprecated will rename to genTsType in next major release */
export let getTsType = genTsType;
