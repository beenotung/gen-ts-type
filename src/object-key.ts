function isSafeObjectKey(key: string): boolean {
  if (key.length === 0) {
    return false;
  }
  if (!key[0].match(/[a-z]/i)) {
    return false;
  }
  for (let i = 1; i < key.length; i++) {
    if (!key[i].match(/[a-z]|[0-9]|_/i)) {
      return false;
    }
  }
  return true;
}

export function toObjectKey(key: string): string {
  if (isSafeObjectKey(key)) {
    return key;
  }
  return JSON.stringify(key);
}
