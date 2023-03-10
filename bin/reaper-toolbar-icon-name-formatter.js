import { prompt, header } from "./modules/components.js";

import ncp from "@qtnrtnd/copy-paste";
import c from "ansi-colors";

const iconNameFormatter = function (name) {
  return new Promise(goToMainMenu => {
    header(name);
    const loop = async function () {
      let str = await prompt('Reaper action name: ');
      if (str === EXIT_FUNCTION) {
        goToMainMenu();
        return;
      }
      str = str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]|^[a-z0-9\s]+:/g, '')
        .trim()
        .replace(/(?<=[\s0-9])\/(?=[\s0-9])/g, '_over_')
        .replace(/(?<=[\s0-9])\.(?=[\s0-9])/g, '_dot_')
        .replace(/(?<=[0-9])\s?%\s?/g, '_percent_')
        .replace(/\s?\+\s?(?=[0-9])/g, '_plus_')
        .replace(/\s?-\s?(?=[0-9])/g, '_minus_')
        .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
        .replace(/[^a-z0-9]+/g, '_')
      ncp.copy(str, () => {
        process.stdout.write(`Output: ${c.yellow(str)} ${c.gray('[copied to clipboard]')}\n`);
        loop();
      })
    };
    loop();
  })
};

export default iconNameFormatter;