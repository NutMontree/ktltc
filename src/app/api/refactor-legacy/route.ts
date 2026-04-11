import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  const map: Record<string, {name: string, code: string}> = {
    welder: { name: "ช่างเชื่อมโลหะ", code: "Welding Tech" },
    technology: { name: "เทคโนโลยีธุรกิจดิจิทัล", code: "Digital Tech" },
    ordinary: { name: "สามัญสัมพันธ์", code: "Ordinary" },
    mechanic: { name: "ช่างยนต์", code: "Mechanic" },
    hotel: { name: "การโรงแรม", code: "Hotel" },
    electronics: { name: "ช่างอิเล็กทรอนิกส์", code: "Electronics" },
    electricity: { name: "ช่างไฟฟ้ากำลัง", code: "Electricity" },
    construct: { name: "ช่างก่อสร้าง", code: "Construction" },
    accounting: { name: "การบัญชี", code: "Accounting" }
  };

  const results = [];
  const baseDir = path.join(process.cwd(), "src", "app", "(website)");

  for (const [key, val] of Object.entries(map)) {
    const pagePath = path.join(baseDir, key, "page.tsx");
    if (!fs.existsSync(pagePath)) {
        results.push(`Missing: ${key}`);
        continue;
    }

    let content = fs.readFileSync(pagePath, "utf-8");
    
    // 1. Strip redundant imports
    content = content.replace(/import\s*\{\s*Data\s*\}\s*from\s*"\.\/data";\n?/, "");
    content = content.replace(/import\s*\{\s*Image\s*\}\s*from\s*"[^"]+";\n?/, "");
    content = content.replace(/import\s*\{\s*BackgroundGradient\s*\}\s*from\s*"[^"]+";\n?/, "");
    
    // Add PersonnelList import near framer-motion if not present
    if (!content.includes("PersonnelList")) {
       content = content.replace(
           /import\s*\{\s*motion\s*\}\s*from\s*"framer-motion";/, 
           `import { motion } from "framer-motion";\nimport PersonnelList from "../(components)/PersonnelList";`
       );
    }

    // 2. Remove containerVar and itemVar definitions
    // Match something like "const containerVar = { hidden: ..., visible: ... };"
    content = content.replace(/const\s+containerVar\s*=\s*(?:\{|.*?)(?:\n.*?)*?hidden[\s\S]*?visible[\s\S]*?(?:.*?\}\s*;\s*\n|\n\n)/g, "");

    // 3. Replace the actual grid block (using simple string slicing to be safer than regex for huge trees)
    const gridStartToken = "{/* --- Grid Content --- */}";
    const sectionEndToken = "</section>";

    const startIndex = content.indexOf(gridStartToken);
    const lastSectionEnd = content.lastIndexOf(sectionEndToken);

    if (startIndex !== -1 && lastSectionEnd !== -1) {
        // Find the </div> right before </section>
        const contentBeforeSectionEnd = content.substring(0, lastSectionEnd);
        const lastDivEndIndex = contentBeforeSectionEnd.lastIndexOf("</div>");

        if (lastDivEndIndex !== -1 && lastDivEndIndex > startIndex) {
            const replacement = `{/* --- Personnel Grid Content --- */}\n        <PersonnelList departmentName="${val.name}" departmentCode="${val.code}" />\n      `;
            content = content.substring(0, startIndex) + replacement + content.substring(lastDivEndIndex);
            
            // Re-check itemVar just in case the greedy regex failed safely
            content = content.replace(/const\s+itemVar\s*=\s*\{[\s\S]*?(?:hidden:.+?\}|visible:.+?\}|scale:.+?\}|\})\s*\};?/g, '');
        }
    }

    fs.writeFileSync(pagePath, content, "utf-8");
    results.push(`Success: ${key}`);
  }

  return NextResponse.json({ success: true, migrated: results });
}
