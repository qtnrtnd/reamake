import c from "ansi-colors";
import { resolve } from "path";

const missing = function (path) {
  process.stdout.write(`${c.red(`"${path}" not found.`)}\nPlease add missing item(s) or change your Reaper directory path in "${pathResolve('res/settings.json')}".\n`);
}

export { missing };