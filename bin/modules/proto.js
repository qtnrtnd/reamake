import { nanoid } from "nanoid";

Math.__proto__.mod = function (a, b) {
  return ((a % b) + b) % b
}

console.__proto__.capture = new class {
  #output = '';
  #stdoutWrite = process.stdout.write;
  constructor() {
    this.start();
  };
  start() {
    const _this = this;
    process.stdout.write = function (chunk, encoding, callback) {
      _this.#output += chunk.toString();
      _this.#stdoutWrite.call(process.stdout, chunk, encoding, callback);
      return true;
    }
  };
  clear() {
    this.#output = '';
  }
  stop() {
    process.stdout.write = this.#stdoutWrite;
  };
  log() {
    if(this.#output) console.log(this.#output.trim());
  };
}

global.REAMAKE = {
  EXIT_FUNCTION: nanoid()
};