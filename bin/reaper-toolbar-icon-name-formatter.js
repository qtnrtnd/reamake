import { prompt } from "./modules/components.js";

import ncp from "copy-paste";
import c from "ansi-colors";

const iconNameFormatter = async function () {
  let str = await prompt('Reaper action name: ');
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
    console.log(`Output: ${c.yellow(str)} ${c.gray('[copied to clipboard]')}`)
    iconNameFormatter();
  })
};

export default iconNameFormatter;