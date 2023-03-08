import "./modules/proto.js";
import { selectMenu, header } from "./modules/components.js";
import liveArchiver from "./reaper-live-theme-archiver.js";
import iconNameFormatter from "./reaper-toolbar-icon-name-formatter.js";

const main = async function () {
  header('Main Menu');
  const programs = [
    'Live Theme Archiver',
    'Toolbar Icon Name Formatter'
  ];
  const selected = await selectMenu(programs, undefined, true);
  console.clear();
  if (selected === programs[0]) await liveArchiver(programs[0]);
  else if (selected === programs[1]) await iconNameFormatter(programs[1]);
  console.clear()
  console.capture.clear();
  console.capture.start();
  main();
};
main();