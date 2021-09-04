#! node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@dfoverdx/tocamelcase");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var isbinaryfile_1 = require("isbinaryfile");
var json5_1 = __importDefault(require("json5"));
var files = process.argv.slice(2);
for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
    var file = files_1[_i];
    if (!fs_1.default.existsSync(file)) {
        console.error("File '" + file + "' does not exist.");
        process.exit(1);
    }
    if (!fs_1.default.statSync(file).isFile()) {
        console.error("File '" + file + "' is not a file.  It is likely a directory.");
        process.exit(1);
    }
    var buffer = fs_1.default.readFileSync(file);
    if ((0, isbinaryfile_1.isBinaryFileSync)(buffer)) {
        console.error("File '" + file + "' is not a text file.");
    }
    var text = buffer.toString();
    var json = void 0;
    var jsonText = void 0;
    try {
        json = json5_1.default.parse(text);
        jsonText = JSON.stringify(json, null, 2);
    }
    catch (_a) {
        console.error("File '" + file + "' is not a valid json file.");
        process.exit(1);
    }
    jsonText = jsonText.replace(/(?<=^\s*)"(\w+?)"(?=:)/gm, '$1')
        .replace(/"(.*?)"(?!=:)/g, "'$1'");
    if (typeof json === 'object') {
        jsonText = jsonText
            .replace(/(?<=: .*),$/mg, ';')
            .replace(/(?<=: .*(['\d]|true|false|mull))$/gm, ';');
    }
    var _b = (typeof json === 'object' && !Array.isArray(json))
        ? ['interface', '', '']
        : ['type', ' =', ';'], typeOrInterface = _b[0], equals = _b[1], terminator = _b[2];
    var name_1 = path_1.default.basename(file);
    var typeName = (name_1.includes('.') ? name_1.slice(0, name_1.indexOf('.')) : name_1).toCamelCase(true);
    var output = typeOrInterface + " " + typeName + equals + " " + jsonText + terminator + "\n\ndeclare const " + typeName + ": " + typeName + ";\n\nexport = " + typeName + ";";
    console.log("Writing " + file + ".d.ts");
    fs_1.default.writeFileSync(file + ".d.ts", output);
}
