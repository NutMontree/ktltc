const fs = require("fs");
const path = require("path");

function syncPublic() {
  const rootDir = path.resolve(__dirname, "..");
  const sourcePublic = path.join(rootDir, "public");
  const targetPublic = path.join(rootDir, ".next", "standalone", "public");

  if (!fs.existsSync(sourcePublic)) {
    console.warn("source public directory does not exist:", sourcePublic);
    return;
  }

  if (!fs.existsSync(targetPublic)) {
    fs.mkdirSync(targetPublic, { recursive: true });
  }

  const items = fs.readdirSync(sourcePublic);
  let linkedCount = 0;

  for (const item of items) {
    const srcItemPath = path.join(sourcePublic, item);
    const destItemPath = path.join(targetPublic, item);

    if (!fs.existsSync(destItemPath)) {
      try {
        fs.symlinkSync(srcItemPath, destItemPath);
        linkedCount++;
      } catch (err) {
        console.warn(`Failed to symlink ${item}:`, err.message);
      }
    }
  }

  // Also ensure .next/static symlink
  const sourceStatic = path.join(rootDir, ".next", "static");
  const targetStaticDir = path.join(rootDir, ".next", "standalone", ".next");
  const targetStatic = path.join(targetStaticDir, "static");

  if (fs.existsSync(sourceStatic)) {
    if (!fs.existsSync(targetStaticDir)) {
      fs.mkdirSync(targetStaticDir, { recursive: true });
    }
    if (!fs.existsSync(targetStatic)) {
      try {
        fs.symlinkSync(sourceStatic, targetStatic);
      } catch (err) {
        console.warn("Failed to symlink .next/static:", err.message);
      }
    }
  }

  console.log(`✅ [sync-standalone-public] Synced ${linkedCount} items to standalone/public.`);
}

syncPublic();
