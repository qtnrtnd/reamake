import { nanoid } from "nanoid";
import { dirname, resolve } from "path";

Math.__proto__.mod = function (a, b) {
  return ((a % b) + b) % b;
}

const root = process.argv[2] === 'build' ? resolve('bin') : (process.pkg ? dirname(process.execPath) : process.cwd())

Object.assign(global, {
  EXIT_FUNCTION: nanoid()
});

export { root };