import { defaultSettings, settingsPath } from "../bin/modules/settings.js";
import { writeFileSync } from "fs";

writeFileSync(settingsPath, JSON.stringify(defaultSettings, undefined, '\t'));
process.exit(0);