export function wrapType(type: string): string {
  if (
    type.startsWith('{') &&
    type.endsWith('}') &&
    type.indexOf('{', 1) === -1 &&
    type.indexOf('}') === type.length - 1
  ) {
    // has one and only one bracket
    return type;
  }
  if (
    type.startsWith('(') &&
    type.endsWith(')') &&
    type.indexOf('(', 1) === -1 &&
    type.indexOf(')') === type.length - 1
  ) {
    // already wrapped
    return type;
  }
  return `(${type})`;
}

export function biOpType(op: string, aType: string, bType: string): string {
  if (aType === '{}') {
    return bType;
  }
  if (bType === '{}') {
    return aType;
  }
  return wrapType(aType) + ` ${op} ` + wrapType(bType);
}

export function andType(aType: string, bType: string): string {
  return biOpType('&', aType, bType);
}

export function orType(aType: string, bType: string): string {
  return biOpType('|', aType, bType);
}
