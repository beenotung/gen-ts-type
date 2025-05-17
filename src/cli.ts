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
    /* formatting options */
    format: toBoolean(process.env.format),
    semi: toBoolean(process.env.semi),
    currentIndent: process.env.currentIndent,
    indentStep: process.env.indentStep,
    /* array options */
    allowEmptyArray: toBoolean(process.env.allowEmptyArray),
    allowMultiTypedArray: toBoolean(process.env.allowMultiTypedArray),
    allowOptionalFieldInArray: toBoolean(process.env.allowOptionalFieldInArray),
  });
  console.log(type);
}

function toBoolean(value: string | undefined) {
  value = (value || '').toLowerCase();
  switch (value) {
    case '1':
    case 'true':
    case 'on':
      return true;
    default:
      return false;
  }
}

const filename = process.argv[2];
catchMain(main(filename));
