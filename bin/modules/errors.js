import c from "ansi-colors";
import { resolve } from "path";

const missing = function (path) {
  process.stdout.write(c.red(`"${path}" not found.\nPlease add missing item(s) or change your Reaper directory path in "settings.json".\n`));
};

const cantFound = function (path) {
  process.stdout.write(c.yellow(`"${path}" not found.\n`));
};

const cantWrite = function (path, mess) {
  process.stdout.write(c.red(`An error occurred while writing file "${path}".${mess ? '\n' + mess : ''}\n`));
};

export { missing, cantWrite, cantFound };