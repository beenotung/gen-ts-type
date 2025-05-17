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

### List of optional environment variables

Output options:

- `name`: declare as named type, if not set, the type will be anonymous.
- `export`: export the type, default: `false`

Formatting options:

- `indent`: initial indent level, default: `''` (no indent)
- `indent_step`: indent step, default: `'  '` (2 spaces)
- `semi_colon`: add semicolon after each object property, default: `false`
- `include_sample`: include sample value in the comment, default: `false`

Type inference options:

- `union_type`: `false` to collapse all variants of objects in array as optional fields, `true` to use union type without optional fields, default: `false`

### From typescript

```typescript
import { genTsType } from 'gen-ts-type'
import * as fs from 'fs'

const UserType = genTsType(
  { user: 'Alice', friends: [{ user: 'Bob', since: new Date() }] },
  { format: true },
)
const code = `export type User = ${UserType};`
fs.writeFileSync('types.ts', code)
```

Above example generate into:

```typescript
export type User = {
  user: string
  friends: Array<{
    user: string
    since: Date
  }>
}
```

## Features

### Supported features

- primitive types
  - string
  - number
  - boolean
  - bigint
  - Date
  - symbol (not specific)
- Array (single-type / union-type)
- Object (strict-type / optional-type)
- named custom type

### Todo features

- Tuple (specific-type array) (e.g. `[number, string, string]`)
- specific symbol / string / number
- Enum
