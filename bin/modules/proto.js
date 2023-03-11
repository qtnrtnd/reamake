import { nanoid } from "nanoid";
import { accessSync, constants } from "fs";
import { resolve } from "path";

Math.__proto__.mod = function (a, b) {
  return ((a % b) + b) % b;
}

// let readOnly = false;

// try {
//   accessSync(resolve('../res'), constants.W_OK);
// } catch {
//   readOnly = true;
// }

Object.assign(global, {
  EXIT_FUNCTION: nanoid()
});