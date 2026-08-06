const fs = require('fs');
let content = fs.readFileSync('src/constants/classrooms.ts', 'utf-8');
const regex = /\[(.*?)\]/s;
const match = regex.exec(content);
if(match) {
  const items = match[1].split(',').map(s => s.trim().replace(/\"/g, '')).filter(s => s);
  
  // Create a new set to hold only the base classroom names (strip anything from '(' onwards)
  const baseItems = items.map(item => item.split('(')[0].trim());
  const newSet = new Set(baseItems);
  newSet.add('พบ.21'); // Ensure it's there
  
  const arr = Array.from(newSet).sort(); // Sort alphabetically for a nicer dropdown
  const newArrStr = '[\n  "' + arr.join('",\n  "') + '"\n]';
  const newContent = content.replace(regex, newArrStr);
  fs.writeFileSync('src/constants/classrooms.ts', newContent);
  console.log('Successfully cleaned classrooms.ts, total unique base classrooms:', arr.length);
}
