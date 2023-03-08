import { rl, mainMenuKey } from "./events.js";
import { keyPress } from "./events.js";
import c from "ansi-colors";

const prompt = function (str = '') {
  return new Promise(resolve => rl.question(str, resolve));
}

const selectMenu = function (items, selected = 0, blockMainMenuEvent = false) {
  console.capture.stop();
  function writeMenu(it, s) {
    console.clear()
    console.capture.log()
    it.forEach((i, j) => {
      const selected = s === j
      console.log(c[selected ? 'white' : 'gray'](`${selected ? '→ ' : '  '}${i}`))
    })
  }
  writeMenu(items, selected)
  return new Promise(resolve => {
    const keyPressHandler = function (chunk, key) {
      if (!blockMainMenuEvent && mainMenuKey(key)) {
        keyPress.stopListening(keyPressHandler);
        resolve(REAMAKE.EXIT_FUNCTION)
      }else if (key.name === 'up' || key.name === 'down') {
        selected = Math.mod(selected + (key.name === 'up' ? -1 : 1), items.length);
        writeMenu(items, selected)
      } else if (key.name === 'return') {
        keyPress.stopListening(keyPressHandler);
        process.stdout.write('\u001b[1A');
        console.capture.start();
        resolve(items[selected]);
      }
    }
    keyPress.listen(keyPressHandler);
  })
}

const header = function (str) {
  console.log(`${c.white.bgCyan(' ReaMake 1.0.0 ')}${c.black.bgWhite(` ${str} \n`)}${c.gray('Main Menu: Alt+M | Exit: Ctrl+C\n')}`);
}

export { prompt, selectMenu, header };