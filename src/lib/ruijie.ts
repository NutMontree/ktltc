import { execFile } from 'child_process';
import util from 'util';
import crypto from 'crypto';

const execFilePromise = util.promisify(execFile);

export async function getRuijieReyeePorts(ip: string): Promise<any[]> {
  const pwd = 'Ktltc@33110';
  const md5Hash = crypto.createHash('md5').update(pwd).digest('hex');

  // 1. Authenticate and extract cookie directly using curl.exe
  const loginResult = await execFilePromise('curl.exe', [
    '-s',
    '-i',
    '-X', 'POST',
    '-d', `passwd=${md5Hash}`,
    `http://${ip}/index.cgi`
  ]);

  const rawHeader = loginResult.stdout || '';
  const cookieMatches = rawHeader.match(/set-cookie:\s*([^;\r\n]+)/gi) || [];
  const cookieStr = cookieMatches.map(m => m.replace(/set-cookie:\s*/i, '').trim()).join('; ');

  // 2. Fetch panel.cgi using session cookies
  const panelResult = await execFilePromise('curl.exe', [
    '-s',
    '-H', `Cookie: ${cookieStr}`,
    `http://${ip}/panel.cgi`
  ]);

  const html = panelResult.stdout || '';

  const ports: any[] = [];
  const itemRegex = /<div class="panel-item[^"]*"[^>]*>[\s\S]*?<div style="font-size:13px;"><p>([^<]*)<\/p><p>([^<]*)<\/p>[\s\S]*?<span>(\d+)<\/span>/g;
  let m: RegExpExecArray | null;

  while ((m = itemRegex.exec(html)) !== null) {
    const statusRaw = m[1].trim();
    const speedRaw = m[2].trim();
    const portNum = parseInt(m[3], 10);
    const isUp = statusRaw.toLowerCase() === 'connected';
    const isSFP = portNum >= 27;

    let speed = '--';
    if (isUp) {
      if (speedRaw.includes('1000M')) speed = '1Gbps';
      else if (speedRaw.includes('100M')) speed = '100Mbps';
      else if (speedRaw.includes('10M')) speed = '10Mbps';
      else speed = speedRaw || '1Gbps';
    }

    ports.push({
      portNum,
      port: isSFP ? `Port ${portNum} (SFP)` : `Port ${portNum}`,
      status: isUp ? 'UP' : 'DOWN',
      speed,
      type: isSFP ? 'WAN/Uplink' : 'LAN',
      deviceType: isSFP ? 'Uplink' : 'LAN',
      lldpName: isSFP && isUp ? '🔌 Core Switch (Uplink)' : '',
      ip: isSFP && isUp ? '192.168.6.3' : '',
      mac: ''
    });
  }

  ports.sort((a, b) => a.portNum - b.portNum);
  return ports;
}
