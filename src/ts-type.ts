/* name -> type */
const typeMap = new Map<string, string>();

export function setTsType(name: string, type: string): void {
  typeMap.set(name, type);
}

export function getTsType(
  o: any,
  options: {
    format?: boolean;
    currentIndent?: string | '';
    indentStep?: string | '  ';
  } & { allowEmptyArray?: boolean } = {},
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
      if (Array.isArray(o)) {
        if (o.length < 1) {
          if (options.allowEmptyArray) {
            return 'any[]';
          }
          throw new TypeError('cannot determine type of empty array');
        }
        return `Array<${getTsType(o[0], options)}>`;
      } else {
        if (options.format) {
          const currentIndent = options.currentIndent || '';
          const indentStep = options.indentStep || '  ';
          const innerIndent = currentIndent + indentStep;
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
