import { genTsType } from '../src/ts-type';

console.log(
  genTsType(
    { user: 'Alice', friends: [{ user: 'Bob', since: new Date() }] },
    { format: true },
  ),
);
console.log(
  genTsType([{ name: 'Alice' }, { name: 'Bob', nickname: 'Charlie' }], {
    allowOptionalFieldInArray: true,
  }),
);
console.log(genTsType(new Set([1, 2])));
console.log(genTsType(new Set([1, 2, 'str']), { allowMultiTypedArray: true }));
console.log(genTsType(new Map([['age', 12]])));
