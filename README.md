# gen-ts-type

Generate TypeScript types from sample data in browser, node.js, and cli.

[![npm Package Version](https://img.shields.io/npm/v/gen-ts-type)](https://www.npmjs.com/package/gen-ts-type)

## Installation

```bash
# Install as dev dependency, then use with "npx gen-ts-type"
npm i -D gen-ts-type

# Or install as global dependency, then use with "gen-ts-type"
npm i -g gen-ts-type
```

## Usage

### Usage from CLI

```bash
# Generate type from stdin
echo -n 'export type PackageJSON = ' > package.d.ts
echo '{"name": "test", "version": "1.0.0"}' | npx gen-ts-type >> package.d.ts

# Generate type from a JSON file
export=true name=PackageJSON npx gen-ts-type package.json > package.d.ts
```

Generated type in file `package.d.ts` will be like:

```typescript
export type PackageJSON = {
  name: string
  version: string
}
```

#### CLI Environment Variables

Type Declaration Options:

- `name`: Declare as named type (e.g. `type User = ...`)
- `export`: Export the type declaration (default: `false`)

Formatting Options:

- `indent`: Initial indent level (default: `''`, i.e. no indent)
- `indent_step`: Indent step size (default: `'  '`, i.e. 2 spaces)
- `semi_colon`: Add semicolons after object properties (default: `false`)
- `include_sample`: Include sample values in comments (default: `false`)

Type Inference Options:

- `union_type`: Use union of exact types for array objects instead of optional fields (default: `false`)

### Usage from TypeScript

```typescript
import { genTsType } from 'gen-ts-type'
import { writeFileSync } from 'fs'

const type = genTsType(
  {
    name: 'Alice',
    friends: [{ name: 'Bob', since: new Date() }],
  },
  {
    export: true,
    name: 'User',
    semi_colon: true,
  },
)

writeFileSync('user.d.ts', type)
```

Generated type in file `user.d.ts` will be:

```typescript
export type User = {
  name: string
  friends: Array<{
    name: string
    since: Date
  }>
}
```

#### TypeScript API Options

When using the `genTsType` function, you can provide options via an object:

```typescript
interface GenTsTypeOptions {
  // Type Declaration
  name?: string
  export?: boolean

  // Formatting
  indent?: string
  indent_step?: string
  semi_colon?: boolean
  include_sample?: boolean

  // Type Inference
  union_type?: boolean
}
```

Example with union_type:

```typescript
// Data:
const data = [
  { name: 'Alice', year: 2000 },
  { name: 'Bob', age: 20 },
]

// With union_type=false (default):
type Data = Array<{
  name: string
  year?: number
  age?: number
}>

// With union_type=true:
type Data = Array<
  | {
      name: string
      year: number
    }
  | {
      name: string
      age: number
    }
>
```

## Features

### Supported Types

- Primitive Types
  - string
  - number
  - boolean
  - bigint
  - Date
  - symbol
  - null
  - undefined
- Complex Types
  - Array (single-type and union-type)
  - Set
  - Map
  - Object (with optional properties)
  - Function

### Type Inference Features

- Detect array of varies object shape, and collapse into optional property or union type
- Union type support for array elements and object properties
- Special character handling in object keys
- Nested object and array support
- Generic type inference for collections (Array/Set/Map)
