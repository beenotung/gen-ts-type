# gen-ts-type

Generate TypeScript types from sample data in browser, node.js, and cli.

[![npm Package Version](https://img.shields.io/npm/v/gen-ts-type)](https://www.npmjs.com/package/gen-ts-type)

> 🔥 Use it directly on [Online Playground](https://gen-ts-type.surge.sh)

## Quick Example

From CLI:

```bash
# Generate type from JSON file
echo -n 'export type User = ' > user.d.ts
npx -y gen-ts-type user.json >> user.d.ts
```

From TypeScript:

```typescript
import { genTsType } from 'gen-ts-type'
import { writeFileSync } from 'fs'
const data = {
  name: 'Alice',
  age: 20,
  hobbies: ['coding', 'reading'],
  contact: {
    email: 'alice@example.com',
    phone: null,
  },
  lastLogin: new Date(),
}

const code = genTsType(data, { export: true, name: 'User' })
writeFileSync('user.d.ts', code)
```

Generated type:

```typescript
export type User = {
  name: string
  age: number
  hobbies: Array<string>
  contact: {
    email: string
    phone: null
  }
  lastLogin: Date
}
```

See [Usage](#usage) section below for more options and advanced features.

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

### Advanced Usage with Lower-level APIs

More examples in [examples/advanced-usage.ts](examples/advanced-usage.ts) and [test/ts-type-test.ts](test/ts-type-test.ts)

#### Modify Inferred Type Structure

For more control over the type generation process, you can use the lower-level `inferType()` function and `Type` class directly:

```typescript
import { inferType, Type } from 'gen-ts-type'

// Infer type structure without generating type declaration
let userType: Type = inferType({
  name: 'Alice',
  friends: [{ name: 'Bob', since: new Date() }],
})

// Make the User.friends[number].since field optional
{
  let friendType = userType.object![1].type.array![0]
  let sinceType = friendType.object![1].type
  sinceType.optional = true
}

// Add User.is_admin field
{
  let isAdminType = new Type({ path: '', indent: '  ' })
  isAdminType.primitive = [true]
  isAdminType.nullable = true
  userType.object!.push({
    key: 'is_admin',
    type: isAdminType,
  })
}

// Generate type declaration with custom options
let code = 'export type User = '
code += userType.toString({
  include_sample: true,
  semi_colon: true,
})

console.log(code)
```

The output of above example:

```typescript
export type User = {
  name: string /** e.g. "Alice" */
  friends: Array<{
    name: string /** e.g. "Bob" */
    since?: Date /** e.g. "2025-05-17T08:35:10.429Z" */
  }>
  is_admin: null | boolean /** e.g. true */
}
```

The Type class provides access to the inferred type structure:

- `type.object`: Array of object fields `{ key: string, type: Type }`
- `type.array`: Array of element types
- `type.primitive`: Array of primitive values
- `type.nullable`: Whether the type includes null
- `type.optional`: Whether the type includes undefined
- `type.toString(options)`: Generate type declaration string

#### Example with union_type

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

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
