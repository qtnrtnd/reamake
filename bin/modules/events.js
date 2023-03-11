import readline from "readline";
import ansiEscapes from "ansi-escapes";

const mainMenuKey = function (key) {
  return key.name === 'm' && key.meta;
};

const keyPress = {
  listen(callback) {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.on('keypress', callback);
  },
  stopListening(callback) {
    process.stdin.off('keypress', callback);
  }
}

keyPress.listen((chunk, key) => {
  if (key.ctrl && key.name === 'c') process.exit(0);
});

const rl = new class {
  constructor() {
    this.disableTerminal();
  }
  enableTerminal() {
    this.value.close();
    this.value = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });
    process.stdout.write(ansiEscapes.cursorShow);
  };
  disableTerminal() {
    this.value?.close();
    this.value = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    process.stdout.write(ansiEscapes.cursorHide);
  };
};

const mainMenuKeyPress = function (callback) {
  return new Promise(async resolve => {
    const keyPressHandler = function (chunk, key) {
      if (mainMenuKey(key)) {
        keyPress.stopListening(keyPressHandler);
        resolve(EXIT_FUNCTION);
      }
    }
    keyPress.listen(keyPressHandler);
    if (callback) {
      const r = await callback();
      keyPress.stopListening(keyPressHandler);
      resolve(r);
    }
  });
};

const anyKeyPress = function () {
  return new Promise(async resolve => {
    const keyPressHandler = function () {
      keyPress.stopListening(keyPressHandler);
      resolve();
    }
    keyPress.listen(keyPressHandler);
  });
};

export { keyPress, rl, mainMenuKey, mainMenuKeyPress, anyKeyPress };