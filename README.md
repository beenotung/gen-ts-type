# gen-ts-type
Generate Typescript type from sample data

[![npm Package Version](https://img.shields.io/npm/v/gen-ts-type.svg?maxAge=2592000)](https://www.npmjs.com/package/gen-ts-type)

## Installation
```bash
npm i -g gen-ts-type
```

## Usage
### From cli
```bash
echo 'export type Package = ' | tee package.d.ts
format=1 allowEmptyArray=1 allowMultiTypedArray=1 gen-ts-type package.json | tee -a package.d.ts
```
### From typescript
```typescript
import { genTsType } from 'gen-ts-type';
import * as fs from 'fs';

const UserType = genTsType(
    { user: 'Alice', friends: [{ user: 'Bob', since: new Date() }] },
    { format: true },
  );
const code = `export type User = ${UserType};`
fs.writeFileSync('types.ts', code);
```
Above example generate into:
```typescript
export type User = {
  "user": string;
  "friends": Array<{
    "user": string;
    "since": Date;
  }>;
}
```

## Features

### Supported features
- string
- named custom type
- number
- boolean
- bigint
- symbol (not specific)
- Date
- Array (single-type / multi-type)
- Object

### Todo features
- Tuple (specific array) (e.g. `[number, string, string]`)
- specific symbol / string / number
- Enum
