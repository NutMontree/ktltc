import { NodeSSH } from 'node-ssh';

export async function getCiscoPorts(ip: string): Promise<any[]> {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: ip,
      username: 'cisco',
      password: 'Ktltc@33110',
      readyTimeout: 8000,
      tryKeyboard: true,
      onKeyboardInteractive: (_name: any, _instructions: any, _instructionsLang: any, prompts: any, finish: any) => {
        if (prompts.length > 0) {
          finish(['Ktltc@33110']);
        }
      },
      algorithms: {
        kex: [
          'diffie-hellman-group1-sha1',
          'diffie-hellman-group14-sha1',
          'diffie-hellman-group-exchange-sha1',
          'diffie-hellman-group-exchange-sha256'
        ],
        cipher: [
          'aes128-cbc',
          'aes192-cbc',
          'aes256-cbc',
          'aes128-ctr',
          'aes192-ctr',
          'aes256-ctr',
          '3des-cbc'
        ],
        serverHostKey: [
          'ssh-rsa',
          'ssh-dss'
        ]
      }
    });

    if (ssh.connection) {
      ssh.connection.on('error', () => {});
    }

    const shell = await ssh.requestShell();
    shell.on('error', () => {});

    let combinedOutput = '';

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        try {
          shell.end();
          ssh.dispose();
        } catch (e) {}
        resolve();
      }, 7000);

      shell.on('data', (d: any) => {
        const str = d.toString('utf8');
        combinedOutput += str;
        if (str.includes('User Name:')) {
          shell.write('cisco\n');
        } else if (str.includes('Password:')) {
          shell.write('Ktltc@33110\n');
        }
      });

      setTimeout(() => {
        shell.write('terminal datadump\n');
        setTimeout(() => {
          shell.write('show interfaces status\n');
          setTimeout(() => {
            shell.write('show mac address-table\n');
            setTimeout(() => {
              shell.write('exit\n');
              setTimeout(() => {
                clearTimeout(timer);
                try {
                  shell.end();
                  ssh.dispose();
                } catch (e) {}
                resolve();
              }, 800);
            }, 1000);
          }, 1200);
        }, 400);
      }, 1000);
    });

    try {
      ssh.dispose();
    } catch (e) {}

    return parseSG500Output(combinedOutput);
  } catch (err: any) {
    try {
      ssh.dispose();
    } catch (e) {}
    throw err;
  }
}

function parseSG500Output(raw: string) {
  const ports: any[] = [];
  const lines = raw.split('\n');
  const macMap: Record<string, string[]> = {};

  // Extract MAC addresses from show mac address-table
  for (const line of lines) {
    const m = line.match(/\s*(\d+)\s+([0-9a-fA-F:]{17})\s+(gi\d+\/\d+\/\d+)/i);
    if (m) {
      const portKey = m[3].toLowerCase();
      const mac = m[2];
      if (!macMap[portKey]) macMap[portKey] = [];
      macMap[portKey].push(mac);
    }
  }

  // Parse interfaces status
  for (const line of lines) {
    const trimmed = line.trim();
    const m = trimmed.match(/^(gi1\/1\/(\d+))\s+([\w-]+)\s+([\w-]+|\-\-)\s+([\w-]+|\-\-)\s+([\w-]+|\-\-)\s+([\w-]+|\-\-)\s+(Up|Down)/i);
    if (m) {
      const fullPort = m[1].toLowerCase();
      const portNum = parseInt(m[2], 10);
      const speedRaw = m[5];
      const isUp = m[8].toLowerCase() === 'up';

      let speedStr = '--';
      if (isUp) {
        if (speedRaw === '1000') speedStr = '1Gbps';
        else if (speedRaw === '100') speedStr = '100Mbps';
        else if (speedRaw === '10') speedStr = '10Mbps';
        else speedStr = speedRaw ? `${speedRaw}Mbps` : '1Gbps';
      }

      const portMacs = macMap[fullPort] || [];
      const primaryMac = portMacs[0] || '';

      let type = 'LAN';
      let deviceType = 'LAN';
      let defaultLabel = '';

      if (portNum >= 1 && portNum <= 20) {
        type = 'LAN';
        deviceType = 'LAN';
        defaultLabel = isUp ? (primaryMac ? `💻 PC (${primaryMac})` : '💻 LAN (VLAN 10)') : '💻 พอร์ต LAN (VLAN 10)';
      } else if (portNum >= 21 && portNum <= 23) {
        type = 'WAN/Uplink';
        deviceType = 'Uplink';
        defaultLabel = portNum === 22 ? '🔌 Link ชั้น 3 (การบัญชี)' : portNum === 23 ? '🔌 Link ชั้น 1' : '🔌 Link Inter-Switch';
      } else if (portNum === 24) {
        type = 'WAN/Uplink';
        deviceType = 'Uplink';
        defaultLabel = '🔌 Core Switch Uplink (Trunk)';
      } else if (portNum >= 25 && portNum <= 26) {
        type = 'WAN/Uplink';
        deviceType = 'Uplink';
        defaultLabel = isUp ? '⚡ Fiber Optic Uplink (SFP)' : '⚡ ช่อง Fiber SFP (พร้อมใช้งาน)';
      } else {
        type = 'WAN/Uplink';
        deviceType = 'Uplink';
        defaultLabel = '🔌 Stacking Port (1G/5G)';
      }

      ports.push({
        portNum,
        port: portNum >= 25 ? `Port ${portNum} (SFP)` : `Port ${portNum}`,
        status: isUp ? 'UP' : 'DOWN',
        speed: speedStr,
        type,
        deviceType,
        lldpName: defaultLabel,
        deviceName: isUp ? defaultLabel : '',
        mac: primaryMac,
        allMacs: portMacs
      });
    }
  }

  // Ensure SFP 27 & 28 exist for complete 28-port visual
  if (!ports.some((p) => p.portNum === 27)) {
    ports.push({
      portNum: 27,
      port: 'Port 27 (SFP)',
      status: 'DOWN',
      speed: '--',
      type: 'WAN/Uplink',
      deviceType: 'Uplink',
      lldpName: '🔌 Stacking Port S3 (1G/5G)',
      deviceName: '',
      mac: '',
      allMacs: []
    });
  }

  if (!ports.some((p) => p.portNum === 28)) {
    ports.push({
      portNum: 28,
      port: 'Port 28 (SFP)',
      status: 'DOWN',
      speed: '--',
      type: 'WAN/Uplink',
      deviceType: 'Uplink',
      lldpName: '🔌 Stacking Port S4 (1G/5G)',
      deviceName: '',
      mac: '',
      allMacs: []
    });
  }

  ports.sort((a, b) => a.portNum - b.portNum);
  return ports;
}
