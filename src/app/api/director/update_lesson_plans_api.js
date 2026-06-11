const fs = require('fs');

const file = 'd:\\ktltc\\src\\app\\api\\director\\lesson-plans\\route.ts';
let content = fs.readFileSync(file, 'utf8');

// Update PATCH
const patchTarget = `    const { _id, status, feedback } = await req.json();
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;`;

const patchReplace = `    const body = await req.json();
    const { _id, status, feedback, subject, title, fileUrl, semester, academicYear } = body;
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;
    
    // For teacher edits
    if (subject) updateData.subject = subject;
    if (title) updateData.title = title;
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (semester) updateData.semester = semester;
    if (academicYear) updateData.academicYear = academicYear;
`;

content = content.replace(patchTarget, patchReplace);

// Add DELETE
const deleteBlock = `
export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("lesson_plans").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lesson plan" }, { status: 500 });
  }
}
`;

content += deleteBlock;

fs.writeFileSync(file, content);
console.log("Updated API route successfully.");
