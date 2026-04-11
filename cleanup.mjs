import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dirs = ["resource", "plan", "develop", "academic"];
const basePath = path.join(__dirname, "src", "app", "(website)");
let total = 0;

for (const dir of dirs) {
  const dirPath = path.join(basePath, dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".tsx") && f !== "page.tsx" && f !== "layout.tsx");
  
  for (const file of files) {
    if (["StructureResource.tsx", "DataCenter.tsx", "Planning.tsx", "Developing.tsx", "Academic.tsx"].includes(file)) {
       continue;
    }
    
    const filePath = path.join(dirPath, file);
    if (!fs.statSync(filePath).isFile()) continue;

    let content = fs.readFileSync(filePath, "utf-8");
    let originalContent = content;
    
    const h1Index = content.indexOf(">คณะผู้รับผิดชอบ");
    if (h1Index !== -1) {
       const h1Start = content.lastIndexOf("<h1", h1Index);
       if (h1Start !== -1) {
           content = content.substring(0, h1Start) + "\n    </>\n  );\n}\n";
       }
    } else {
       const gridIndex = content.indexOf(`<div className="grid gap-4`);
       if (gridIndex !== -1) {
           content = content.substring(0, gridIndex) + "\n    </>\n  );\n}\n";
       } else {
         const grid2Index = content.indexOf(`<div className="grid`);
         if (grid2Index !== -1) {
             content = content.substring(0, grid2Index) + "\n    </>\n  );\n}\n";
         }
       }
    }
    
    content = content.replace(/import \{ Data \} from "\.\/data";\r?\n?/g, "");
    content = content.replace(/import \{ Image \} from "@heroui\/image";\r?\n?/g, "");
    
    // Some files might have `<div className="rounded...` holding an Image alone 
    content = content.replace(/<div[^>]*>[\s]*<Image[^>]*src="\/images\/บุคลากร[^>]*\/>[\s]*<\/div>/g, "");
    // And some files have `flex justify-center pb-4` around the leader image
    content = content.replace(/<div className="flex justify-center pb-4">[\s\S]*?<Image[\s\S]*?<\/div>[\s\S]*?<\/div>/g, "");

    if (content !== originalContent) {
       fs.writeFileSync(filePath, content);
       console.log(`Cleaned: ${dir}/${file}`);
       total++;
    }
  }
}

console.log(`\nSuccessfully cleaned ${total} files. Please verify the UI!`);
