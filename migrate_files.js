const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Only copy if file doesn't exist or is different size
    if (!fs.existsSync(dest) || fs.statSync(src).size !== fs.statSync(dest).size) {
        fs.copyFileSync(src, dest);
        console.log(`Copied: ${src} -> ${dest}`);
    }
  }
}

try {
    const localPublic = 'D:\\ktltc\\public';
    const remoteZ = 'Z:';
    console.log(`Starting migration from ${localPublic} to ${remoteZ}...`);
    copyRecursiveSync(localPublic, remoteZ);
    console.log('Migration finished successfully!');
} catch (err) {
    console.error('Migration failed:', err);
}
