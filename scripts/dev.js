const { spawn, execSync } = require('child_process');
const next = spawn('npx.cmd', ['next', 'dev'], { stdio: 'inherit', shell: true });
const cf = spawn('cloudflared', ['access', 'tcp', '--hostname', 'db.ktltc.site', '--url', 'localhost:27017'], { stdio: 'inherit', shell: true });

function cleanup() {
  try { execSync('taskkill /pid ' + next.pid + ' /t /f', {stdio: 'ignore'}); } catch(e) {}
  try { execSync('taskkill /pid ' + cf.pid + ' /t /f', {stdio: 'ignore'}); } catch(e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
