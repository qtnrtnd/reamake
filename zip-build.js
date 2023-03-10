import meta from "./bin/modules/meta.js";

import { readdirSync, lstatSync } from "fs";
import { join, resolve } from "path";
import AdmZip from "adm-zip";

const buildPath = resolve('./build');
const tempPath = resolve('./temp');
const unpackedContent = readdirSync(tempPath);

unpackedContent.forEach(file => {
  if (lstatSync(join(tempPath, file)).isFile()) {
    const zip = new AdmZip();
    zip.addLocalFolder(join(tempPath, 'res'), 'res');
    zip.addLocalFile(join(tempPath, file));
    zip.getEntries().forEach((entry) => {
      entry.header.method = 8;
    });
    zip.writeZip(join(buildPath, `${meta.name.toLowerCase()}-${meta.version.replace(/\./g, '-')}-win.zip`));
  }
});