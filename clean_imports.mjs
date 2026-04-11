import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, "src", "app", "(website)");
const dirs = ["resource", "plan", "develop", "academic"];

for (const dir of dirs) {
  const dirPath = path.join(basePath, dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".tsx"));
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (!fs.statSync(filePath).isFile()) continue;

    let content = fs.readFileSync(filePath, "utf-8");
    let originalContent = content;

    // Check if the file actually uses `<Image`
    if (!content.includes("<Image")) {
       // If not, explicitly remove the import
       content = content.replace(/import\s*\{\s*Image\s*\}\s*from\s*"@heroui\/image"\s*;\r?\n?/g, "");
    }
    
    // Also remove unused `Data` import
    if (!content.includes("Data.")) {
       content = content.replace(/import\s*\{\s*Data\s*\}\s*from\s*"\.\/data"\s*;\r?\n?/g, "");
    }

    if (content !== originalContent) {
       fs.writeFileSync(filePath, content);
       console.log(`Cleaned imports: ${dir}/${file}`);
    }
  }
}
