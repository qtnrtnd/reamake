import { nanoid } from "nanoid";

Math.__proto__.mod = function (a, b) {
  return ((a % b) + b) % b;
}

Object.assign(global, {
  EXIT_FUNCTION: nanoid()
});