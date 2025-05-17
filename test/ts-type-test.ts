import { genTsType, GenTsTypeOptions } from '../src/ts-type';

function test(
  name: string,
  expectedType: string,
  data: any,
  options?: GenTsTypeOptions,
) {
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
  { semi_colon: true },
);
test(
  'nested Object and Array with formatting',
  `{
  user: string
  friends: Array<{
    user: string
    since: Date
  }>
}`,
  { user: 'Alice', friends: [{ user: 'Bob', since: new Date() }] },
  { semi_colon: false },
);

test(
  'Array of Object with optional field',
  `Array<{
  name: string;
  nickname?: string;
}>`,
  [{ name: 'Alice' }, { name: 'Bob', nickname: 'Charlie' }],
  { union_type: false, semi_colon: true },
);
test(
  'Array of Object with optional field',
  `Array<{
  name: string
  nickname?: string
}>`,
  [{ name: 'Alice' }, { name: 'Bob', nickname: 'Charlie' }],
  { union_type: false, semi_colon: false },
);

test(
  'Nested Object with different types in array (collapse)',
  `Array<{
  items: Array<{
    name: string
    age?: number
    year?: number
  }>
}>`,
  [
    { items: [{ name: 'Alice', age: 30 }] },
    { items: [{ name: 'Alice', year: 2000 }] },
  ],
  { union_type: false },
);
test(
  'Nested Object with different types in array (union type)',
  `Array<{
  items: Array<{
    name: string
    age: number
  } | {
    name: string
    year: number
  }>
}>`,
  [
    { items: [{ name: 'Alice', age: 30 }] },
    { items: [{ name: 'Alice', year: 2000 }] },
  ],
  { union_type: true },
);

test(
  'Object with key having special characters',
  `{
  name: string
  bin: {
    'gen-ts-type': string
  }
  devDependencies: {
    '@types/node': string
  }
  mixed_object: {
    'no_space': string
    'has space': string
  }
}`,
  {
    name: 'gen-ts-type',
    bin: {
      'gen-ts-type': 'gen-ts-type.js',
    },
    devDependencies: {
      '@types/node': '^22.15.18',
    },
    mixed_object: {
      no_space: 'sample_value',
      'has space': 'sample value',
    },
  },
);

test('Set', `Set<number>`, new Set([1, 2]));

test('Set with multiple type', `Set<number | string>`, new Set([1, 2, 'str']), {
  union_type: true,
});

test('Map', `Map<string, number>`, new Map([['age', 12]]));
