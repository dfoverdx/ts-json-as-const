#! node
import '@dfoverdx/tocamelcase';
import fs from 'fs';
import path from 'path';
import { isBinaryFileSync } from 'isbinaryfile';
import json5 from 'json5';
import stringifyObject from 'stringify-object';

const files = process.argv.slice(2);

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`File '${file}' does not exist.`);
    process.exit(1);
  }

  if (!fs.statSync(file).isFile()) {
    console.error(`File '${file}' is not a file.  It is likely a directory.`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(file);

  if (isBinaryFileSync(buffer)) {
    console.error(`File '${file}' is not a text file.`);
  }

  const text = buffer.toString();
  let json: any;
  let jsonText: string;

  try {
    json = json5.parse(text);
    jsonText = stringifyObject(json, {
      indent: '  ',
      inlineCharacterLimit: 80,
    });
  } catch {
    console.error(`File '${file}' is not a valid json file.`);
    process.exit(1);
  }

  const [declarationType, equals, terminator] =
    typeof json === 'object'
      ? !Array.isArray(json)
        ? ['interface', '', ''] as const
        : ['type', ' =', ';'] as const
      : ['const', ' =', ';'] as const;

  const name = path.basename(file);
  const typeName = (name.includes('.') ? name.slice(0, name.indexOf('.')) : name).toCamelCase(true);
  const output = `${declarationType !== 'const'
    ? `${declarationType} ${typeName}${equals} ${jsonText}${terminator}

declare const ${typeName}: ${typeName};`
    : `declare ${declarationType} ${typeName}${equals} ${jsonText}${terminator}`}

export = ${typeName};`;

  console.log(`Writing ${file}.d.ts`);
  fs.writeFileSync(`${file}.d.ts`, output);
}