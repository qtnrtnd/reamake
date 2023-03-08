import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve as pathResolve } from "path";
import c from "ansi-colors";

const rawSettings = new Proxy(JSON.parse(readFileSync('./settings.json')), {
  set(target, prop, value) {
    target[prop] = value;
    writeFileSync(pathResolve('./settings.json'), JSON.stringify(target, undefined, '\t'), 'utf8');
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
        console.log(c.gray(`Reaper directory path automatically set to "${path}".\nYou can change it in "${pathResolve('../settings.json')}".`));
      } else {
        let validPath = false
        while (!validPath) {
          path = await prompt.ask('Please enter your Reaper directory path: ');
          if (existsSync(path)) validPath = true;
          else console.log(c.red(`"${path}" not found.`));
        }
      }
      rawSettings.reaperDir = path;
      resolve(path);
    }
  })
}

export default settings;