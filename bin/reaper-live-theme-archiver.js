import settings from "./modules/settings.js";
import { missing } from "./modules/errors.js";
import { f, date, isSubdirectory } from "./modules/utilities.js";
import { selectMenu, header } from "./modules/components.js";
import { keyPress, mainMenuKey, mainMenuKeyPress } from "./modules/events.js";

import { readdirSync, lstatSync, readFileSync, existsSync } from "fs";
import { extname, relative, dirname, join, sep } from "path";
import Watcher from "watcher";
import AdmZip from "adm-zip";
import c from "ansi-colors";

const liveArchiver = function (name) {
  return new Promise(async goToMainMenu => {
    header(name);
    const reaperDir = await settings.reaperDir();
    const colorThemesDir = join(reaperDir, "/ColorThemes");
    const themes = [];

    if(!existsSync(colorThemesDir)) {
      missing(colorThemesDir);
      await mainMenuKeyPress();
      goToMainMenu();
      return;
    }

    const rootElts = readdirSync(colorThemesDir);
    rootElts.forEach((name) => {
      const dir = join(colorThemesDir, "/" + name);
      if (lstatSync(dir).isDirectory()) {
        const dirElts = readdirSync(dir);
        let i = 0;
        let validTheme = false;
        while (!validTheme && i < dirElts.length) {
          if (extname(dirElts[i]) === ".ReaperTheme") {
            validTheme = true;
            themes.push(name);
          } else i++;
        }
      }
    });
  
    if (themes.length > 0) {
      console.log("Select a Reaper theme to watch:");
      const themeName = await selectMenu(themes);
      if (themeName === REAMAKE.EXIT_FUNCTION) {
        goToMainMenu();
        return;
      }
  
      const themeDir = join(colorThemesDir, "/" + themeName);
      const zipPath = join(colorThemesDir, "/" + themeName + ".ReaperThemeZip");
      let timer, renamedDir, removedDir, addedDir;
      const zip = new AdmZip();
      zip.addLocalFolder(themeDir);
      zip.getEntries().forEach((entry) => {
        entry.header.method = 0;
      });
      const writeZip = function (notice = true) {
        if (renamedDir) {
          zip.deleteFile(f(relative(themeDir, renamedDir)) + "/");
          renamedDir = null;
        }
        if (removedDir) {
          zip.deleteFile(f(relative(themeDir, removedDir)) + "/");
          removedDir = null;
        }
        if (addedDir) {
          addedDir = null;
        }
        zip.writeZip(zipPath);
        if (notice)
          console.log(c.gray(`"${themeName}.ReaperThemeZip" has been updated.`));
      };
      writeZip(false);
  
      const watcher = new Watcher(themeDir, {
        debounce: 100,
        renameTimeout: 100,
        recursive: true,
        renameDetection: true,
        ignoreInitial: true,
        native: false
      });
  
      watcher.on("ready", () => {
        console.log(`\nWatching "${themeDir}". Waiting for changes...\n`);
      });
      watcher.on("all", (event, path, newPath) => {
        if (
          ((event === "unlink" || event === "unlinkDir") && !existsSync(path)) ||
          ((event === "change" || event === "add" || event === "addDir") && existsSync(path)) ||
          ((event === "rename" || event === "renameDir") && !existsSync(path) && existsSync(newPath))
        ) {
          const rel = relative(themeDir, path);
          const relNew = newPath ? relative(themeDir, newPath) : null;
          if (event === "renameDir") {
            if (!renamedDir) {
              renamedDir = path;
              console.log(`${date()} ${c.yellow("renamed")} "${rel + sep}" → "${relNew + sep}"`);
            }
          } else if (event === "rename") {
            if (!renamedDir || !isSubdirectory(path, renamedDir)) {
              console.log(`${date()} ${c.yellow("renamed")} "${rel}" → "${relNew}"`);
            }
            const file = zip.getEntry(f(rel));
            zip.addFile(f(relNew), file.getData());
            zip.deleteFile(file);
            zip.getEntry(f(relNew)).header.method = 0;
          } else if (event === "unlinkDir") {
            if (!removedDir) {
              removedDir = path;
              console.log(`${date()} ${c.red("removed")} "${rel + sep}"`);
            }
          } else if (event === "unlink") {
            if (!removedDir || !isSubdirectory(path, removedDir)) {
              console.log(`${date()} ${c.red("removed")} "${rel}"`);
            }
            zip.deleteFile(f(rel));
          } else if (event === 'addDir') {
            if (!addedDir) {
              addedDir = path;
              console.log(`${date()} ${c.green("added")} "${rel + sep}"`);
            }
          } else if (event === "add") {
            if (!addedDir || !isSubdirectory(path, addedDir)) {
              console.log(`${date()} ${c.green("added")} "${rel}"`);
            }
            const zipFileDir = f(dirname(rel));
            zip.addLocalFile(path, zipFileDir !== "." ? zipFileDir : undefined);
            zip.getEntry(f(rel)).header.method = 0;
          } else if (event === "change") {
            console.log(`${date()} ${c.yellow("modified")} "${rel}"`);
            zip.updateFile(f(rel), readFileSync(path));
          }
          clearTimeout(timer);
          timer = setTimeout(writeZip, 500);
        }
      });
  
      await mainMenuKeyPress();
      watcher.close();
    } else {
      console.log(c.yellow(`No unpacked Reaper theme found in "${colorThemesDir}".`));
      await mainMenuKeyPress();
    }
    goToMainMenu();
  });
};

export default liveArchiver;
