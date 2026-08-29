const { spawn, execSync } = require('child_process');
const fs = require('fs');

let cfCmd = 'cloudflared';
if (fs.existsSync('C:\\Program Files (x86)\\cloudflared\\cloudflared.exe')) {
  cfCmd = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';
} else if (fs.existsSync('C:\\Program Files\\cloudflared\\cloudflared.exe')) {
  cfCmd = 'C:\\Program Files\\cloudflared\\cloudflared.exe';
}

const next = spawn('npx.cmd', ['next', 'dev'], { stdio: 'inherit', shell: true });
const cf = spawn(`"${cfCmd}"`, ['access', 'tcp', '--hostname', 'db.ktltc.site', '--url', 'localhost:27017'], { stdio: 'inherit', shell: true });

function cleanup() {
  try { execSync('taskkill /pid ' + next.pid + ' /t /f', {stdio: 'ignore'}); } catch(e) {}
  try { execSync('taskkill /pid ' + cf.pid + ' /t /f', {stdio: 'ignore'}); } catch(e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

