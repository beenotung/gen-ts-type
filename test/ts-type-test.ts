import { genTsType, genTsTypeOptions } from '../src/ts-type';

function test(name: string, expectedType: string, data: any, options?: genTsTypeOptions) {
  let generatedType = genTsType(data, options);
  if (generatedType !== expectedType) {
    console.error('failed:', name);
    console.error('ground truth:', expectedType);
    console.error('generated type:', generatedType);
    console.error('data:', data);
    process.exit(1);
  }
  console.log('passed:', name);
}

test(
  'nested Object and Array with formatting',
  `{
  user: string;
  friends: Array<{
    user: string;
    since: Date;
  }>;
}`,
  { user: 'Alice', friends: [{ user: 'Bob', since: new Date() }] },
  { format: true },
);

test(
  'Array of Object with optional field',
  `Array<{
  name: string;
  nickname?: string;
}>`,
  [{ name: 'Alice' }, { name: 'Bob', nickname: 'Charlie' }],
  { allowOptionalFieldInArray: true },
);

test(
  'Set',
  `Set<number>`,
  new Set([1, 2]),
);

test(
  'Set with multiple type',
  `Set<number | string>`,
  new Set([1, 2, 'str']),
  { allowMultiTypedArray: true },
);

test(
  'Map',
  `Map<string, number>`,
  new Map([['age', 12]]),
);
