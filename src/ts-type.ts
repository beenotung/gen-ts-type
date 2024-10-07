import { mapGetOrSetDefault } from '@beenotung/tslib/map';
/* name -> type */
import { genFunctionType } from './function-type';
import { toObjectKey } from './object-key';

const typeMap = new Map<string, string>();

export function setTsType(name: string, type: string): void {
  typeMap.set(name, type);
}

export interface GenTsTypeOptions {
  /* indentation options */
  format?: boolean;
  semi?: boolean; // default: true
  currentIndent?: string | '';
  indentStep?: string | '  ';
  /* array options */
  allowEmptyArray?: boolean;
  allowMultiTypedArray?: boolean;
  // only effective to object array
  allowOptionalFieldInArray?: boolean;
}

export function genTsType(o: any, options: GenTsTypeOptions = {}): string {
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
          let total = 0;
          for (const x of o) {
            if (
              x &&
              typeof x === 'object' &&
              !(x instanceof Date) &&
              !(x instanceof Map) &&
              !(x instanceof Set)
            ) {
              // really object
              total++;
              for (const [key, value] of Object.entries(x)) {
                const type = genTsType(value, nextLevelOption);
                const field = mapGetOrSetDefault(fields, key, () => ({
                  types: new Set(),
                  count: 0,
                }));
                field.count++;
                field.types.add(type);
              }
            } else {
              // not object
              nonObjectTypes.add(genTsType(x, nextLevelOption));
            }
          }
          let res = 'Array<{';
          fields.forEach((field, key) => {
            res += '\n' + innerIndent + toObjectKey(key);
            if (field.count === total) {
              // all items has this field
              res += ':';
            } else {
              // only some items has this field, this field is optional
              res += '?:';
            }
            res += ' ' + Array.from(field.types).join(' | ');
            if (options.semi !== false) {
              res += ';';
            }
          });
          res += '\n' + currentIndent + '}>';
          nonObjectTypes.forEach(type => (res += ' | ' + type));
          return res;
        }
        const childTypes = Array.from(
          new Set(o.map(x => genTsType(x, nextLevelOption))),
        );
        if (childTypes.length === 1) {
          return `Array<${genTsType(o[0], nextLevelOption)}>`;
        }
        if (options.allowMultiTypedArray) {
          return `Array<${childTypes.join(' | ')}>`;
        }
        console.error('array of different types, childTypes:', childTypes);
        throw new Error('array of different types');
      }
      if (o instanceof Set) {
        if (o.size < 1) {
          if (options.allowEmptyArray) {
            return 'Set<any>';
          }
          throw new TypeError('cannot determine type of empty set');
        }
        return genTsType(Array.from(o), nextLevelOption).replace(
          'Array',
          'Set',
        );
      }
      if (o instanceof Map) {
        if (o.size < 1) {
          if (options.allowEmptyArray) {
            return 'Map<any>';
          }
          throw new TypeError('cannot determine type of empty map');
        }
        const keyType = Array.from(
          new Set(Array.from(o.keys()).map(x => genTsType(x, nextLevelOption))),
        ).join(' | ');
        const valueType = Array.from(
          new Set(
            Array.from(o.values()).map(x => genTsType(x, nextLevelOption)),
          ),
        ).join(' | ');
        return `Map<${keyType}, ${valueType}>`;
      }
      // really object
      if (options.format) {
        let res = '{';
        Object.entries(o).forEach(([k, v]) => {
          res += `\n${innerIndent}${toObjectKey(k)}: ${genTsType(
            v,
            nextLevelOption,
          )}`;
          if (options.semi !== false) {
            res += ';';
          }
        });
        res += '\n' + currentIndent + '}';
        return res;
      }
      return `{ ${Object.entries(o)
        .map(([k, v]) => `${toObjectKey(k)}: ${genTsType(v, nextLevelOption)}`)
        .join('; ')} }`;
    default:
      console.error('unknown type', { type, o });
      throw new TypeError('unknown type: ' + type);
  }
}

/** @deprecated will rename to genTsType in next major release */
export let getTsType = genTsType;
