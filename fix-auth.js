const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.ts')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('src/app/api/election');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace imports
  content = content.replace(/import { cookies } from "next\/headers";\s*import { jwtVerify } from "jose";/g, 'import { auth } from "@/auth";');
  
  // Replace verifyAdmin
  content = content.replace(/async function verifyAdmin\(\) \{[\s\S]*?return null;\n  \}\n\}/g, 
`async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String((session.user as any).role || '').toLowerCase().trim();
  if (['super_admin', 'admin', 'director', 'teacher'].includes(role)) {
    return session.user;
  }
  return null;
}`);

  // Replace verifyStudent
  content = content.replace(/async function verifyStudent\(\) \{[\s\S]*?return null;\n  \}\n\}/g,
`async function verifyStudent() {
  const session = await auth();
  if (!session?.user) return null;
  const role = String((session.user as any).role || '').toLowerCase().trim();
  if (role === 'student') {
    return session.user;
  }
  return null;
}`);

  // Replace student.userId with student.id
  content = content.replace(/student\.userId/g, 'student.id');
  
  // Replace admin.userId with admin.id (if it exists)
  content = content.replace(/admin\.userId/g, 'admin.id');

  fs.writeFileSync(file, content);
}
console.log('Fixed auth in ' + files.length + ' files.');
