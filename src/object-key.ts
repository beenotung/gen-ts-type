export function isSafeObjectKey(key: string): boolean {
  if (key.length === 0) {
    return false;
  }
  for (let char of key) {
    if (char === '_') {
      continue;
    }
    if ('a' <= char && char <= 'z') {
      continue;
    }
    if ('A' <= char && char <= 'Z') {
      continue;
    }
    if ('0' <= char && char <= '9') {
      continue;
    }
    return false;
  }
  return true;
}

export function toSafeObjectKey(key: string): string {
  let double_quote = JSON.stringify(key);
  if (key.includes("'")) {
    return double_quote;
  }
  let value = double_quote.slice(1, -1);
  return `'${value}'`;
}
