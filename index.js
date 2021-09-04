"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@dfoverdx/tocamelcase");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isbinaryfile_1 = require("isbinaryfile");
const json5_1 = __importDefault(require("json5"));
const files = process.argv.slice(2);
for (const file of files) {
    if (!fs_1.default.existsSync(file)) {
        console.error(`File '${file}' does not exist.`);
        process.exit(1);
    }
    if (!fs_1.default.statSync(file).isFile()) {
        console.error(`File '${file}' is not a file.  It is likely a directory.`);
        process.exit(1);
    }
    const buffer = fs_1.default.readFileSync(file);
    if ((0, isbinaryfile_1.isBinaryFileSync)(buffer)) {
        console.error(`File '${file}' is not a text file.`);
    }
    const text = buffer.toString();
    let json;
    let jsonText;
    try {
        json = json5_1.default.parse(text);
        jsonText = JSON.stringify(json, null, 2);
    }
    catch {
        console.error(`File '${file}' is not a valid json file.`);
        process.exit(1);
    }
    jsonText = jsonText.replace(/(?<=^\s*)"(\w+?)"(?=:)/gm, '$1')
        .replace(/"(.*?)"(?!=:)/g, "'$1'");
    if (typeof json === 'object') {
        jsonText = jsonText
            .replace(/(?<=: .*|[\]\}]),$/mg, ';')
            .replace(/(?<=: .*(['\d]|true|false|mull))$/gm, ';');
    }
    const [typeOrInterface, equals, terminator] = (typeof json === 'object' && !Array.isArray(json))
        ? ['interface', '', '']
        : ['type', ' =', ';'];
    const name = path_1.default.basename(file);
    const typeName = (name.includes('.') ? name.slice(0, name.indexOf('.')) : name).toCamelCase(true);
    const output = `${typeOrInterface} ${typeName}${equals} ${jsonText}${terminator}

declare const ${typeName}: ${typeName};

export = ${typeName};`;
    console.log(`Writing ${file}.d.ts`);
    fs_1.default.writeFileSync(`${file}.d.ts`, output);
}
