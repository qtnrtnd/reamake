import { relative, isAbsolute } from "path"

const f = function (path) {
  return path.replace(/\\/g, '/');
}

const date = function(){
  return new Date().toLocaleTimeString()
}

const isSubdirectory = function (dir, parent) {
  const rel = relative(parent, dir);
  return rel && !rel.startsWith('..') && !isAbsolute(rel);
}

export { f, date, isSubdirectory };