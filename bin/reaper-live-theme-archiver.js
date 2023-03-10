import { settings } from "./modules/settings.js";
import { missing } from "./modules/errors.js";
import { f, date, isSubdirectory } from "./modules/utilities.js";
import { selectMenu, header } from "./modules/components.js";
import { anyKeyPress, mainMenuKeyPress } from "./modules/events.js";

import { readdirSync, lstatSync, readFileSync, existsSync } from "fs";
import { extname, relative, dirname, join, sep } from "path";
import Watcher from "@qtnrtnd/watcher";
import AdmZip from "adm-zip";
import c from "ansi-colors";

const liveArchiver = function (name) {
  return new Promise(async goToMainMenu => {
    header(name);
    const reaperDir = await settings.reaperDir();
    const colorThemesDir = join(reaperDir, "ColorThemes");
    const themes = [];

    if(!existsSync(colorThemesDir)) {
      missing(colorThemesDir);
      await anyKeyPress();
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
      process.stdout.write("Select a Reaper theme to watch:\n\n");
      const themeName = await selectMenu(themes);
      if (themeName === EXIT_FUNCTION) {
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
          process.stdout.write(c.gray(`"${themeName}.ReaperThemeZip" has been updated.\n`));
      };
      writeZip(false);
  
      const watcher = new Watcher(themeDir, {
        debounce: 100,
        renameTimeout: 100,
        recursive: true,
        renameDetection: true,
        ignoreInitial: true
      });
  
      watcher.on("ready", () => {
        process.stdout.write(`\nWatching "${themeDir}". Waiting for changes...\n\n`);
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
              process.stdout.write(`${date()} ${c.yellow("renamed")} "${rel + sep}" ??? "${relNew + sep}"\n`);
            }
          } else if (event === "rename") {
            if (!renamedDir || !isSubdirectory(path, renamedDir)) {
              process.stdout.write(`${date()} ${c.yellow("renamed")} "${rel}" ??? "${relNew}"\n`);
            }
            const file = zip.getEntry(f(rel));
            zip.addFile(f(relNew), file.getData());
            zip.deleteFile(file);
            zip.getEntry(f(relNew)).header.method = 0;
          } else if (event === "unlinkDir") {
            if (!removedDir) {
              removedDir = path;
              process.stdout.write(`${date()} ${c.red("removed")} "${rel + sep}"\n`);
            }
          } else if (event === "unlink") {
            if (!removedDir || !isSubdirectory(path, removedDir)) {
              process.stdout.write(`${date()} ${c.red("removed")} "${rel}"\n`);
            }
            zip.deleteFile(f(rel));
          } else if (event === 'addDir') {
            if (!addedDir) {
              addedDir = path;
              process.stdout.write(`${date()} ${c.green("added")} "${rel + sep}"\n`);
            }
          } else if (event === "add") {
            if (!addedDir || !isSubdirectory(path, addedDir)) {
              process.stdout.write(`${date()} ${c.green("added")} "${rel}"\n`);
            }
            const zipFileDir = f(dirname(rel));
            zip.addLocalFile(path, zipFileDir !== "." ? zipFileDir : undefined);
            zip.getEntry(f(rel)).header.method = 0;
          } else if (event === "change") {
            process.stdout.write(`${date()} ${c.yellow("modified")} "${rel}"\n`);
            zip.updateFile(f(rel), readFileSync(path));
          }
          clearTimeout(timer);
          timer = setTimeout(writeZip, 500);
        }
      });
  
      await mainMenuKeyPress();
      watcher.close();
    } else {
      process.stdout.write(c.yellow(`No unpacked Reaper theme found in "${colorThemesDir}".\n`));
      await anyKeyPress();
    }
    goToMainMenu();
  });
};

export default liveArchiver;
