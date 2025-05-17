#!/bin/bash
set -e
set -o pipefail

rm -f sample.ts
npm run build
export=true name=PackageJSON ./gen-ts-type.js package.json >./sample.ts
echo "saved to ./sample.ts"
