const fs = require('fs');
const file = 'src/app/(teaching-record)/TeachingRecordPage/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
let firstHookIdx = -1;
let secondHookIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [users, setUsers] = useState([]);')) {
    if (firstHookIdx === -1) {
      firstHookIdx = i;
    } else {
      secondHookIdx = i;
      break;
    }
  }
}

if (firstHookIdx !== -1 && secondHookIdx !== -1) {
  lines.splice(firstHookIdx, secondHookIdx - firstHookIdx);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully deleted from', firstHookIdx, 'to', secondHookIdx);
} else {
  console.log('Could not find both hooks');
}
