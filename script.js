const fs = require('fs');
const file = 'd:/ktltc/src/app/dashboard/director/student-care/page.tsx';
let content = fs.readFileSync(file, 'utf-8');
const lines = content.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('{/* Modal Header/Images */}'));
const endIdx = lines.findIndex(l => l.includes('{/* Fullscreen Image Viewer */}'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find modal bounds');
  process.exit(1);
}

// Extract up to the end of the modal content (exclude the closing divs)
// endIdx is 2039. The closing divs are 2035, 2036, 2037.
// We want to slice up to 2034.
let endBound = endIdx - 4; 
let modalLines = lines.slice(startIdx, endBound);
let modalContent = modalLines.join('\n');

// Wrap in function
const functionDef = `
  const renderStudentPrintView = (viewRecord: any) => (
    <div className="break-before-page pt-8 w-full relative individual-record print-page">
` + modalContent + `
    </div>
  );
`;

const returnIdx = lines.findIndex(l => l.includes('  return ('));
if (returnIdx === -1) {
  console.log('Could not find return statement');
  process.exit(1);
}

lines.splice(returnIdx, 0, functionDef);

const insertIdx = lines.findIndex(l => l.includes('        </>') && lines[lines.indexOf(l)+1].includes('      )}'));
if (insertIdx === -1) {
  console.log('Could not find insert point');
  process.exit(1);
}

const mapCode = `
            {/* Batch Print Individual Records */}
            {displayedRecords.map((r) => (
              <React.Fragment key={r._id}>
                {renderStudentPrintView(r)}
              </React.Fragment>
            ))}
`;

lines.splice(insertIdx, 0, mapCode);

fs.writeFileSync(file, lines.join('\n'));
console.log('Success!');
