import meta from "./meta.js";
import { rl, mainMenuKey, keyPress, mainMenuKeyPress } from "./events.js";

import c from "ansi-colors";
import ansiEscapes from "ansi-escapes";

const prompt = async function (str = '') {
  rl.enableTerminal();
  const r = await mainMenuKeyPress(() => {
    return new Promise(resolve => rl.value.question(str, (ans) => {
      resolve(ans);
    }));
  });
  rl.disableTerminal();
  return r;
}

const selectMenu = function (items, selected = 0, blockMainMenuEvent = false) {
  let menuExists = false;
  function writeMenu(it, s) {
    if (menuExists) {
      process.stdout.write(ansiEscapes.eraseLines(items.length + 1));
    } else menuExists = true;
    it.forEach((i, j) => {
      const selected = s === j
      process.stdout.write(c[selected ? 'white' : 'gray'](`${selected ? '→ ' : '  '}${i}\n`))
    })
  }
  writeMenu(items, selected)
  return new Promise(resolve => {
    const keyPressHandler = function (chunk, key) {
      if (!blockMainMenuEvent && mainMenuKey(key)) {
        keyPress.stopListening(keyPressHandler);
        resolve(EXIT_FUNCTION)
      }else if (key.name === 'up' || key.name === 'down') {
        selected = Math.mod(selected + (key.name === 'up' ? -1 : 1), items.length);
        writeMenu(items, selected)
      } else if (key.name === 'return') {
        keyPress.stopListening(keyPressHandler);
        resolve(items[selected]);
      }
    }
    keyPress.listen(keyPressHandler);
  })
}

const header = function (str) {

  process.stdout.write(`${c.white.bgCyan(` ${meta.name} ${meta.version} `)}${c.black.bgWhite(` ${str} \n`)}${c.gray('Main Menu: Alt+M | Exit: Ctrl+C')}\n\n`);
}

export { prompt, selectMenu, header };