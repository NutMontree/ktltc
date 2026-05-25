const { execSync } = require('child_process');

try {
  console.log("Restoring file via git...");
  execSync('git checkout -- src/app/dashboard/users/edit/[id]/page.tsx', { cwd: 'd:\\ktltc', stdio: 'inherit' });
  console.log("File restored successfully!");
} catch (err) {
  console.error("Error executing command:", err);
}
