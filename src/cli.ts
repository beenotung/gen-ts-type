import { readFile } from 'fs/promises';
import { catchMain } from '@beenotung/tslib/node';
import { readStreamAllLine } from '@beenotung/tslib/stream';
import { genTsType } from './ts-type';

export async function main(filename?: string) {
  let content: string;
  if (filename) {
    content = (await readFile(filename)).toString();
  } else {
    content = (await readStreamAllLine(process.stdin)).join('\n');
  }
  const json = JSON.parse(content);
  const type = genTsType(json, {
    /* InferTypeOptions */
    indent: getString('indent'),
    indent_step: getString('indent_step'),
    union_type: getBoolean('union_type'),

    /* ToTypeStringOptions */
    include_sample: getBoolean('include_sample'),
    semi_colon: getBoolean('semi_colon'),
    // indent_step: getString('indent_step'), // shared with InferTypeOptions
  });
  console.log(type);
}

function getString(key: string): string | undefined {
  let value =
    process.env[key] ??
    process.env[key.toUpperCase()] ??
    process.env[key.toLowerCase()];
  return value;
}

function getBoolean(key: string): boolean {
  let value = getString(key);
  switch ((value || '').toLowerCase()) {
    case '1':
    case 'true':
    case 'on':
    case 'yes':
    case 'enable':
      return true;
    case '0':
    case 'false':
    case 'off':
    case 'no':
    case 'disable':
    case '':
      return false;
    default:
      throw new Error(`Invalid boolean value: ${JSON.stringify(value)}`);
  }
}

const filename = process.argv[2];
catchMain(main(filename));
