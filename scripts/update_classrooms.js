const fs = require('fs');
let content = fs.readFileSync('src/constants/classrooms.ts', 'utf-8');
const regex = /\[(.*?)\]/s;
const match = regex.exec(content);
if(match) {
  const items = match[1].split(',').map(s => s.trim().replace(/\"/g, '')).filter(s => s);
  const newSet = new Set(items);
  items.forEach(item => {
    if(item.includes('(')) {
      newSet.add(item.split('(')[0]);
    }
  });
  newSet.add('พบ.21');
  
  const arr = Array.from(newSet);
  const newArrStr = '[\n  "' + arr.join('",\n  "') + '"\n]';
  const newContent = content.replace(regex, newArrStr);
  fs.writeFileSync('src/constants/classrooms.ts', newContent);
  console.log('Successfully updated classrooms.ts');
}
