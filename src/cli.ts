import { readFile } from '@beenotung/tslib/fs';
import { catchMain } from '@beenotung/tslib/node';
import { readStreamAllLine } from '@beenotung/tslib/stream';
import { getTsType } from './ts-type';

export async function main(filename?: string) {
  let content: string;
  if (filename) {
    content = (await readFile(filename)).toString();
  } else {
    content = (await readStreamAllLine(process.stdin)).join('\n');
  }
  const json = JSON.parse(content);
  const type = getTsType(json, {
    allowEmptyArray: !!process.env.allowEmptyArray,
    format: !!process.env.format,
  });
  console.log(type);
}

const filename = process.argv[2];
catchMain(main(filename));
