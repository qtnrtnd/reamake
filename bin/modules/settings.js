import { ressourcesPath } from "../index.js";

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve as pathResolve, join } from "path";
import c from "ansi-colors";

const settingsPath = pathResolve('res/settings.json');

const rawSettings = new Proxy(JSON.parse(readFileSync(settingsPath)), {
  set(target, prop, value) {
    target[prop] = value;
    writeFileSync(settingsPath, JSON.stringify(target, undefined, '\t'), 'utf8');
    return true;
  }
});
const settings = Object.assign({}, rawSettings)
const { reaperDir } = rawSettings;
settings.reaperDir = function() {
  return new Promise(async (resolve) => {
    if (reaperDir) resolve(reaperDir);
    else {
      let path
      const splitted = pathResolve('./').split(sep);
      const reaperId = splitted.reverse().indexOf('REAPER');
      if (reaperId >= 0) {
        path = join(...splitted.slice(reaperId).reverse());
        process.stdout.write(c.gray(`Reaper directory path automatically set to "${path}".\nYou can change it in "${settingsPath}".\n`));
      } else {
        let validPath = false
        while (!validPath) {
          path = await prompt('Please enter your Reaper directory path: ');
          if (existsSync(path)) validPath = true;
          else process.stdout.write(c.red(`"${path}" not found.\n`));
        }
      }
      rawSettings.reaperDir = path;
      resolve(path);
    }
  })
}

export default settings;