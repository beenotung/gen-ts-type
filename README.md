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
format=1 allowEmptyArray=1 allowMultiTypedArray=1 ts-node src/cli.ts package.json | tee -a package.d.ts
```
### From typescript
```typescript
import { getTsType } from 'gen-ts-type';
import * as fs from 'fs';

const UserType = getTsType(
    { user: 'Alice', friends: [{ user: 'Bob', since: new Date() }] },
    { format: true },
  );
const code = `export type User = ${UserType};`
fs.writeFileSync('types.ts', code);
```

## Todo
1. allow option to detect enum
2. allow option to treat array as strict tuple (e.g. `[number, string, string]`)
