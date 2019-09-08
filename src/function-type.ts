function parseBracket(s: string) {
  if (s[0] !== '(') {
    throw new Error(`expect '(' for bracket group`);
  }
  const start = 1;
  const end = s.indexOf(')', start);
  if (end === -1) {
    throw new Error(`expect ')' for bracket group`);
  }
  return s
    .substring(start, end)
    .split(',')
    .map(s => s.trim());
}

function parseFunction(func: Function | string): string[] {
  let s = func.toString();
  if (s.startsWith('function ') || s.startsWith('function(')) {
    const idx = s.indexOf('(');
    if (idx === -1) {
      throw new Error(`expect '(' after 'function'`);
    }
    s = s.substr(idx);
    return parseBracket(s);
  }
  if (s.startsWith('(')) {
    return parseBracket(s);
  }
  const idx = s.indexOf('=>');
  if (idx === -1) {
    throw new Error(`expect '=>' after arrow function argument`);
  }
  return [s.substring(0, idx).trim()];
}

export function genFunctionType(func: Function | string): string {
  const args = parseFunction(func);
  return `(${args.join(',')}) => any`;
}
