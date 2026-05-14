const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      // Check if modified in last 3 days
      const now = new Date();
      if (now - stat.mtime < 3 * 24 * 60 * 60 * 1000) {
        results.push({ file, mtime: stat.mtime });
      }
    }
  });
  return results;
}

try {
  const recentFiles = walk('Z:\\');
  console.log(JSON.stringify(recentFiles, null, 2));
} catch (e) {
  console.error(e);
}
