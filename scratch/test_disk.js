
const { execSync } = require('child_process');
try {
    const output = execSync('df -m .').toString();
    console.log('Output of df -m .:\n', output);
} catch (e) {
    console.error('Error running df -m .:', e.message);
}
