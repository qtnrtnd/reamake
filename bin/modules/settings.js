import { prompt } from "./components.js";
import { cantFound, cantWrite } from "./errors.js"

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve as pathResolve, join, sep } from "path";
import c from "ansi-colors";

const defaultSettings = {
  reaperDir: ''
};

const settingsPath = pathResolve('res/settings.json');
let data;

try {
  data = JSON.parse(readFileSync(settingsPath));
} catch {
  data = defaultSettings;
}

const rawSettings = new Proxy(data, {
  set(target, prop, data) {
    target[prop] = data.value;
    if (data.mess) process.stdout.write(data.mess + '\n');
    try {
      writeFileSync(settingsPath, JSON.stringify(target, undefined, '\t'), 'utf8');
      if (data.messOnSuccess) process.stdout.write(data.messOnSuccess + '\n');
    } catch {
      cantWrite(settingsPath, 'Settings could not be saved.');
    }
    return true;
  }
});

const settings = Object.assign({}, rawSettings)
const { reaperDir } = rawSettings;

settings.reaperDir = function() {
  return new Promise(async (resolve) => {
    if (reaperDir) resolve(reaperDir);
    else {
      let path;
      let mess;
      let messOnSuccess;
      const splitted = pathResolve('./').split(sep);
      const reaperId = splitted.reverse().indexOf('REAPER');
      if (reaperId >= 0) {
        path = join(...splitted.slice(reaperId).reverse());
        mess = c.gray(`Reaper directory path automatically set to "${path}".`);
        messOnSuccess = c.gray(`You can change it in "${settingsPath}".`);
      } else {
        let validPath = false
        while (!validPath) {
          path = await prompt('Please enter your Reaper directory path: ');
          if (existsSync(path)) {
            validPath = true;
            mess = c.gray(`\nReaper directory path set to "${path}".`);
          } else cantFound(path);
        }
      }
      rawSettings.reaperDir = {
        value: path,
        mess,
        messOnSuccess
      };
      process.stdout.write('\n');
      resolve(path);
    }
  })
}

export default settings;