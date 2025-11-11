import { writeFile } from "fs/promises";
import path from "node:path";
import { fileURLToPath } from 'node:url'
import pkg from "./package.json" with { type: 'json' };



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, "src", "version.ts");


const content = `
// gen at : ${new Date().toLocaleString()}
export const NAME = "${pkg.name}";
export const VERSION = "${pkg.version}";`

await writeFile(file, content);
