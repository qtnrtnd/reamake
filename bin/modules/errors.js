import c from "ansi-colors"
import { resolve as pathResolve} from "path"

// const errorHandling = function (err, awaitMainMenu = false) {
//   return new Promise(() => {
//     if (err.code === 'ENOENT') {
//       console.log(`${c.red(`"${err.path}" not found.`)}\nPlease add missing item(s) or change your Reaper directory path in "${pathResolve('../settings.json')}".`);
//     } else {
//       console.log(err);
//     }
//     if (awaitMainMenu) {
//       const keyPressHandler = function (chunk, key) {
//         if (mainMenuKey(key)) {
//           keyPress.stopListening(keyPressHandler);
//           resolve()
//         }
//       }
//       keyPress.listen(keyPressHandler);
//     } else resolve();
//   })
// }

const missing = function (path) {
  console.log(`${c.red(`"${path}" not found.`)}\nPlease add missing item(s) or change your Reaper directory path in "${pathResolve('../settings.json')}".`);
}

export { missing };