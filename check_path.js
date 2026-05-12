console.log('Current Working Directory:', process.cwd());
const fs = require('fs');
console.log('Public exists:', fs.existsSync('public'));
console.log('Full Public Path:', require('path').resolve('public'));
