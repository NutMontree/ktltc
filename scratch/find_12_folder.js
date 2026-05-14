const fs = require('fs');
const path = require('path');

function findDir(dir, name) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file === name) {
          results.push(fullPath);
        }
        results = results.concat(findDir(fullPath, name));
      }
    } catch (e) {}
  });
  return results;
}

try {
  const dirs = findDir('Z:\\', '12');
  console.log(JSON.stringify(dirs, null, 2));
} catch (e) {
  console.error(e);
}
