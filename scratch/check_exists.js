const fs = require('fs');
const p12 = 'Z:\\ktltc_news\\PR\\2026\\05\\12';
const p13 = 'Z:\\ktltc_news\\PR\\2026\\05\\13';

console.log(`Path 12 exists: ${fs.existsSync(p12)}`);
console.log(`Path 13 exists: ${fs.existsSync(p13)}`);

if (fs.existsSync('Z:\\ktltc_news\\PR\\2026\\05')) {
    console.log('Contents of 05:');
    console.log(fs.readdirSync('Z:\\ktltc_news\\PR\\2026\\05'));
}
