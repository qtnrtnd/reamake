import { root } from "./proto.js";
import { prompt } from "./components.js";
import { cantFound, cantWrite } from "./errors.js"

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, sep } from "path";
import c from "ansi-colors";

const defaultSettings = {
  reaperDir: ''
};

const settingsPath = join(root, 'res', 'settings.json');
let data;

try {
  data = JSON.parse(readFileSync(settingsPath));
} catch {
  data = defaultSettings;
}

const proxySettings = new Proxy(data, {
  set(target, prop, data) {
    target[prop] = data.value;
    if (data.mess) process.stdout.write(data.mess + '\n');
    if (prop === 'reaperDir') {
      try {
        writeFileSync(settingsPath, JSON.stringify(target, undefined, '\t'), 'utf8');
        if (data.messOnSuccess) process.stdout.write(data.messOnSuccess + '\n');
      } catch {
        cantWrite(settingsPath, 'Settings could not be saved.');
      }
    }
    return true;
  }
});

const settings = Object.assign({}, data)

settings.reaperDir = function() {
  return new Promise(async (resolve) => {
    if (proxySettings.reaperDir) resolve(proxySettings.reaperDir);
    else {
      let path;
      let mess;
      let messOnSuccess;
      const splitted = root.split(sep);
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
      proxySettings.reaperDir = {
        value: path,
        mess,
        messOnSuccess
      };
      process.stdout.write('\n');
      resolve(path);
    }
  })
}

export { settings, defaultSettings, settingsPath };