import { genTsType } from '../src/ts-type';

let expectedType = `{
  users: Array<{
    id: number
    name: string
    friends: Array<{
      id: number
    }>
  }>
}`;

let sample = {
  users: [
    { id: 1, name: 'Alice', friends: [{ id: 1 }] },
    { id: 2, name: 'Bob', friends: [] },
  ],
};

let reflectedType = genTsType(sample, {
  format: true,
  semi: false,
  // allowEmptyArray: true,
  // allowOptionalFieldInArray: true,
  // allowMultiTypedArray: true,
});

if (reflectedType !== expectedType) {
  console.error("reflected array type doesn't match");
  console.error('expected type:', expectedType);
  console.error('reflected type:', reflectedType);
  console.error('sample:', sample);
  process.exit(1);
}

console.log('passed:', 'sample object with empty-able array');
