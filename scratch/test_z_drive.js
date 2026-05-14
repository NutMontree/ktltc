const fs = require('fs');
const path = require('path');

const baseDir = "Z:";
const folder = "test_folder/sub";
const uploadDir = path.join(baseDir, folder);

try {
  fs.mkdirSync(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, "test.txt");
  fs.writeFileSync(filepath, "hello");
  console.log("Created: " + filepath);
  console.log("Absolute: " + path.resolve(filepath));
} catch (e) {
  console.error(e);
}
