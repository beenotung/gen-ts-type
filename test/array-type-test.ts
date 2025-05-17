import { genTsType } from '../src/ts-type';

let expectedType = `{
  users: Array<{
    id: number
    name: string
    friends: Array<{
      id: number
      tags: Array<{
        name: string
      }>
    }>
  }>
}`;

let sample = {
  users: [
    { id: 1, name: 'Alice', friends: [{ id: 2, tags: [{ name: 'work' }] }] },
    { id: 2, name: 'Bob', friends: [{ id: 1, tags: [] }] },
    { id: 3, name: 'Charlie', friends: [] },
  ],
};

let reflectedType = genTsType(sample, {
  semi_colon: false,
});

if (reflectedType !== expectedType) {
  console.error("reflected array type doesn't match");
  console.error('expected type:', expectedType);
  console.error('reflected type:', reflectedType);
  console.error('sample:', sample);
  process.exit(1);
}

console.log('passed:', 'sample object with empty-able array');
