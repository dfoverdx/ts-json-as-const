#! node
import '@dfoverdx/tocamelcase';
import fs from 'fs';
import path from 'path';
import { isBinaryFileSync } from 'isbinaryfile';
import json5 from 'json5';

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
    jsonText = JSON.stringify(json, null, 2);
  } catch {
    console.error(`File '${file}' is not a valid json file.`);
    process.exit(1);
  }

  jsonText = jsonText.replace(/(?<=^\s*)"(\w+?)"(?=:)/gm, '$1')
    .replace(/(?<=^\s*)"([^']*?)"/gm, "'$1'");

  if (typeof json === 'object') {
    jsonText = jsonText
      .replace(/(?<=: .*),$/mg, ';')
      .replace(/(?<=: .*(['\d]|true|false|mull))$/gm, ';');
  }

  const [typeOrInterface, equals, terminator] = (typeof json === 'object' && !Array.isArray(json))
    ? ['interface', '', '']
    : ['type', ' =', ';'];

  const name = path.basename(file);
  const typeName = (name.includes('.') ? name.slice(0, name.indexOf('.')) : name).toCamelCase(true);
  const output =
    `${typeOrInterface} ${typeName}${equals} ${jsonText}${terminator}

declare const ${typeName}: ${typeName};

export = ${typeName};`;

  console.log(`Writing ${file}.d.ts`);
  fs.writeFileSync(`${file}.d.ts`, output);
}