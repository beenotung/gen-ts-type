/* name -> type */
const typeMap = new Map<string, string>();

export function setTsType(name: string, type: string): void {
  typeMap.set(name, type);
}

/** will rename to genTsType in next major release */
export function getTsType(
  o: any,
  options: {
    /* indentation options */
    format?: boolean;
    currentIndent?: string | '';
    indentStep?: string | '  ';
    /* array options */
    allowEmptyArray?: boolean;
    allowMultiTypedArray?: boolean;
  } = {},
): string {
  const type = typeof o;
  switch (type) {
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
      if (Array.isArray(o)) {
        if (o.length < 1) {
          if (options.allowEmptyArray) {
            return 'any[]';
          }
          throw new TypeError('cannot determine type of empty array');
        }
        const childTypes = Array.from(
          new Set(
            o.map(x =>
              getTsType(x, { ...options, currentIndent: innerIndent }),
            ),
          ),
        );
        if (childTypes.length === 1) {
          return `Array<${getTsType(o[0], options)}>`;
        }
        if (options.allowMultiTypedArray) {
          return `Array<${childTypes.join(' | ')}>`;
        }
        console.error('array of different types, childTypes:', childTypes);
        throw new Error('array of different types');
      } else {
        if (options.format) {
          let res = '{';
          Object.entries(o).forEach(([k, v]) => {
            res += `\n${innerIndent}${JSON.stringify(k)}: ${getTsType(v, {
              ...options,
              currentIndent: innerIndent,
            })};`;
          });
          res += '\n' + currentIndent + '}';
          return res;
        }
        return `{ ${Object.entries(o)
          .map(([k, v]) => `${JSON.stringify(k)}: ${getTsType(v, options)}`)
          .join('; ')} }`;
      }
    default:
      console.error('unknown type', { type, o });
      throw new TypeError('unknown type: ' + type);
  }
}

/** will rename to genTsType in next major release */
export let genTsType = getTsType;
