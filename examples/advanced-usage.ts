import { inferType, Type } from '../src/index'

let userType: Type = inferType({
  name: 'Alice',
  friends: [{ name: 'Bob', since: new Date() }],
})

// make the User.fields[number].since field optional
{
  let friendType = userType.object![1].type.array![0]
  let sinceType = friendType.object![1].type
  sinceType.optional = true
}

// add User.is_admin field
{
  let isAdminType = new Type({ path: '', indent: '  ' })
  isAdminType.primitive = [true]
  isAdminType.nullable = true
  userType.object!.push({
    key: 'is_admin',
    type: isAdminType,
  })
}

let code = 'export type User = '
code += userType.toString({
  include_sample: true,
  semi_colon: true,
})

console.log(code)

// Output:
// ================================
// export type User = {
//   name: string /** e.g. "Alice" */;
//   friends: Array<{
//     name: string /** e.g. "Bob" */;
//     since?: Date /** e.g. "2025-05-17T08:35:10.429Z" */;
//   }>;
//   is_admin: null | boolean /** e.g. true */;
// }
// ================================
