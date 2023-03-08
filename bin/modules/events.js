import readline from "readline";

const mainMenuKey = function (key) {
  return key.name === 'm' && key.meta;
}

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', () => {
  process.exit(0);
});

const mainMenuKeyPress = function () {
  return new Promise(resolve => {
    const keyPressHandler = function (chunk, key) {
      if (mainMenuKey(key)) {
        keyPress.stopListening(keyPressHandler);
        resolve()
      }
    }
    keyPress.listen(keyPressHandler);
  })
}

export { keyPress, rl, mainMenuKey, mainMenuKeyPress };