const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'app', 'models');
if (!fs.existsSync(modelsDir)) process.exit(0);

const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
for (const file of files) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let updated = false;

  // Pattern 1:
  // const { MONGODB_URI } = process.env; ... connectMongo();
  const pattern1Start = content.indexOf('const { MONGODB_URI }');
  const pattern1End = content.indexOf('connectMongo();', Math.max(0, pattern1Start)) + 'connectMongo();'.length;
  if (pattern1Start !== -1 && pattern1End > pattern1Start) {
    const chunk = content.substring(pattern1Start, pattern1End);
    content = content.replace(chunk, 'import { connectMongoose } from "@/lib/mongoose";\nconnectMongoose();');
    updated = true;
  } else {
    // Pattern 2:
    // let cached = global.mongoose; ... connectMongo();
    const pattern2Start = content.indexOf('let cached = global.mongoose;');
    const pattern2End = content.indexOf('connectMongo();', Math.max(0, pattern2Start)) + 'connectMongo();'.length;
    if (pattern2Start !== -1 && pattern2End > pattern2Start) {
      const chunk = content.substring(pattern2Start, pattern2End);
      content = content.replace(chunk, 'import { connectMongoose } from "@/lib/mongoose";\nconnectMongoose();');
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}

const modelsTsDir = path.join(__dirname, 'src', 'models');
if (fs.existsSync(modelsTsDir)) {
  const tsFiles = fs.readdirSync(modelsTsDir).filter(f => f.endsWith('.ts'));
  for (const file of tsFiles) {
    const filePath = path.join(modelsTsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const pattern3Start = content.indexOf('export const connectDB = async () => {');
    const pattern3End = content.indexOf('};', Math.max(0, pattern3Start)) + '};'.length;
    if (pattern3Start !== -1 && pattern3End > pattern3Start) {
      const chunk = content.substring(pattern3Start, pattern3End);
      content = content.replace(chunk, 'import { connectMongoose } from "@/lib/mongoose";\nexport const connectDB = connectMongoose;');
      fs.writeFileSync(filePath, content);
      console.log(`Updated TS ${file}`);
    }
  }
}
