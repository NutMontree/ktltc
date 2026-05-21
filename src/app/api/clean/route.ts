import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = "d:\\ktltc\\src\\app\\(website)\\administrativestructure\\page.tsx";
    let content = fs.readFileSync(filePath, "utf-8");

    const idx1 = content.indexOf("setCommittee(commStaff);");
    if (idx1 === -1) {
      return NextResponse.json({ error: "Could not find setCommittee(commStaff);" });
    }

    const idx_catch = content.indexOf("catch (error)", idx1);
    if (idx_catch === -1) {
      return NextResponse.json({ error: "Could not find catch block" });
    }

    // Find the setCommittee([]); inside the catch block
    const idx_set_committee = content.indexOf("setCommittee([]);", idx_catch);
    if (idx_set_committee === -1) {
      return NextResponse.json({ error: "Could not find setCommittee([]);" });
    }
    
    // Find the closing brace of the catch block after setCommittee([]);
    const idx_closing_brace = content.indexOf("}", idx_set_committee);
    if (idx_closing_brace === -1) {
      return NextResponse.json({ error: "Could not find closing brace of catch" });
    }

    const idx_loading = content.indexOf("if (loading)", idx_closing_brace);
    if (idx_loading === -1) {
      return NextResponse.json({ error: "Could not find if (loading)" });
    }

    // Reconstruct content
    let cleanContent = content.substring(0, idx_closing_brace + 1) + 
                       "\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchData();\n  }, []);\n\n  " + 
                       content.substring(idx_loading);

    fs.writeFileSync(filePath, cleanContent, "utf-8");

    return NextResponse.json({ success: true, message: "Successfully cleaned administrativestructure page!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
