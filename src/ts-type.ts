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
  allowEmptyArray?: boolean; // default: true
  allowMultiTypedArray?: boolean;
  // only effective to object array
  allowOptionalFieldInArray?: boolean; // default: true
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
      const allowEmptyArray = options.allowEmptyArray !== false;
      const allowOptionalFieldInArray =
        options.allowOptionalFieldInArray !== false;
      const nextLevelOption = { ...options, currentIndent: innerIndent };
      if (Array.isArray(o)) {
        if (o.length < 1) {
          if (allowEmptyArray) {
            return 'any[]';
          }
          throw new TypeError('cannot determine type of empty array');
        }
        // least 1 element
        if (allowOptionalFieldInArray !== false) {
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
          let objectType = '{';
          for (const [key, field] of fields) {
            objectType += '\n' + innerIndent + toObjectKey(key);
            if (field.count === total) {
              // all items has this field
              objectType += ':';
            } else {
              // only some items has this field, this field is optional
              objectType += '?:';
            }
            cleanEmptyArrayType(field.types);
            if (
              field.types.size === 1 &&
              field.types.has('any[]') &&
              !allowEmptyArray
            ) {
              throw new TypeError('cannot determine type of empty array');
            }
            objectType += ' ' + Array.from(field.types).join(' | ');
            if (options.semi !== false) {
              objectType += ';';
            }
          }
          objectType += '\n' + currentIndent + '}';
          const types: string[] = [];
          if (fields.size > 0) {
            types.push(objectType);
          }
          types.push(...nonObjectTypes);
          return `Array<${types.join(' | ')}>`;
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
      if (o instanceof Set) {
        if (o.size < 1) {
          if (allowEmptyArray) {
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
          if (allowEmptyArray) {
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

function cleanEmptyArrayType(types: Set<string>) {
  if (types.size < 2) {
    return;
  }

  let hasNonEmpty = false;
  for (const type of types) {
    if (type.startsWith('Array<')) {
      hasNonEmpty = true;
      break;
    }
  }

  if (hasNonEmpty) {
    types.delete('any[]');
  }
}

/** @deprecated will rename to genTsType in next major release */
export let getTsType = genTsType;
