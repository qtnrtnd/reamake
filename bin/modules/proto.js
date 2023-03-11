import { nanoid } from "nanoid";
import { dirname, basename, resolve } from "path";

Math.__proto__.mod = function (a, b) {
  return ((a % b) + b) % b;
}

const root = basename(dirname(process.argv[1])) === 'scripts' ? resolve('bin') : (process.pkg ? dirname(process.execPath) : process.cwd())

Object.assign(global, {
  EXIT_FUNCTION: nanoid()
});

export { root };