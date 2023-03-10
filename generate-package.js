import meta from "./bin/modules/meta.js";

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const packagePath = resolve('package.json');
const packageContent = JSON.parse(readFileSync(packagePath));
Object.assign(packageContent, {
  name: meta.name.toLowerCase(),
  version: meta.version,
  description: meta.description
});
writeFileSync(packagePath, JSON.stringify(packageContent, undefined, '\t'));