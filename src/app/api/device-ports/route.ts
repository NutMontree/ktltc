import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';
import { getSNMPPorts } from '@/lib/snmp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  const type = searchParams.get('type') || 'Unknown';
  const brand = searchParams.get('brand') || '';

  if (!ip) {
    return NextResponse.json({ success: false, error: 'Missing IP address' }, { status: 400 });
  }

  // ==========================================
  // 🟢 Ruijie Reyee Easy-Smart Switch (Web API)
  // ==========================================
  if (ip === '192.168.6.32' || ip === '192.168.6.31' || brand === 'Reyee' || type.includes('Reyee')) {
    try {
      const { getRuijieReyeePorts } = await import('@/lib/ruijie');
      const ports = await getRuijieReyeePorts(ip);
      return NextResponse.json({ success: true, data: ports });
    } catch (ruijieErr: any) {
      console.error(`Ruijie Error on ${ip}:`, ruijieErr);
      return NextResponse.json({
        success: false,
        error: `เชื่อมต่อ Ruijie ล้มเหลว: ${ruijieErr.message || ruijieErr.toString()}`
      }, { status: 500 });
    }
  }

  // ==========================================
  // 🟢 SNMP Fallback for Smart Switches
  // ==========================================
  if (type === 'Edge Switch' || ip === '192.168.6.14') {
    try {
      const ports = await getSNMPPorts(ip);
      if (ports.length === 0) {
        throw new Error("Connected via SNMP but found 0 ports. Please check if SNMP is enabled and 'public' community is configured on the switch.");
      }
      return NextResponse.json({ success: true, data: ports });
    } catch (snmpErr: any) {
      console.error(`SNMP Error on ${ip}:`, snmpErr);
      return NextResponse.json({ 
        success: false, 
        error: `การเชื่อมต่อ SNMP ล้มเหลว (SNMP Error): ${snmpErr.message || snmpErr.toString()}` 
      }, { status: 500 });
    }
  }
  // ==========================================

  const ssh = new NodeSSH();
  const isFirewall = ip === '192.168.6.1';
  const username = isFirewall ? 'nut' : 'admin';
  const password = isFirewall ? 'Nut29122539' : 'Ktltc@33110';

  try {
    // Attempt SSH Connection with broad algorithm support for older Enterprise Hardware (Huawei/HPE)
    await ssh.connect({
      host: ip,
      username,
      password,
      readyTimeout: 10000, // เพิ่มเวลาให้รออุปกรณ์นานขึ้น
      tryKeyboard: true,
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
          finish([password]);
        }
      },
      algorithms: {
        kex: [
          'diffie-hellman-group1-sha1',
          'diffie-hellman-group14-sha1',
          'diffie-hellman-group-exchange-sha1',
          'diffie-hellman-group-exchange-sha256',
          'curve25519-sha256',
          'curve25519-sha256@libssh.org',
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
          'ecdh-sha2-nistp521'
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
          'ssh-dss',
          'ecdsa-sha2-nistp256',
          'ecdsa-sha2-nistp384',
          'ecdsa-sha2-nistp521'
        ]
      }
    });

    let rawPorts = '';
    let rawLldp = '';
    let rawMac = '';

    const isVrp = type === 'Firewall' || type === 'Core Switch' || type === 'Huawei';
    
    const shell = await ssh.requestShell();
    let combinedOutput = '';
    
    await new Promise<void>(async (resolve, reject) => {
      // Safety timeout (increased to 15 seconds to allow for paced commands)
      const timeout = setTimeout(() => {
        resolve();
      }, 15000);

      shell.on('data', (data: any) => {
        const text = data.toString('utf8');
        combinedOutput += text;
        if (text.includes('---- More ----') || text.includes('More:')) {
          shell.write(' ');
        }
      });

      shell.on('error', (err: any) => {
        clearTimeout(timeout);
        reject(err);
      });

      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      // 0. Wait 2 seconds for the login banner to finish printing
      await delay(2000);

      // 1. Disable pagination
      shell.write('screen-length 0 temporary\n');
      await delay(300);
      shell.write('no page\n');
      await delay(300);
      shell.write('terminal length 0\n');
      await delay(500);

      // 2. Fetch Ports
      shell.write('display interface brief\n');
      await delay(300);
      shell.write('show interface brief\n');
      await delay(1500); // Give it time to output the table

      // 3. Fetch LLDP
      shell.write('display lldp neighbor brief\n');
      await delay(300);
      shell.write('show lldp neighbors\n');
      await delay(1500);

      // 4. Fetch MAC Addresses
      shell.write('display mac-address\n');
      await delay(300);
      shell.write('show mac-address\n');
      await delay(2000); // MAC table can be large

      // 5. Gracefully quit
      shell.write('quit\n');
      await delay(200);
      shell.write('exit\n');
      
      // We don't call resolve() here immediately, we let the timeout catch it 
      // OR we could resolve early. Let's just wait 2 more seconds for final output.
      await delay(2000);
      clearTimeout(timeout);
      resolve();
    });

    ssh.dispose();

    // Split the giant text block into sections
    // This regex catches either Huawei's or Aruba's LLDP command as the splitting point
    const splitRegex = /display lldp neighbor brief|show lldp neighbors/i;
    const textParts = combinedOutput.split(splitRegex);
    
    const portsText = textParts[0];
    // Combine everything after the LLDP command into the second part
    const lldpText = textParts.length > 1 ? textParts.slice(1).join('\n') : '';

    // Pass combinedOutput as macStr so the parser can scan the whole text for MAC addresses
    const parsedPorts = parseDeviceOutput(portsText, lldpText, combinedOutput, type);

    if (parsedPorts.length === 0) {
      console.error(`RAW OUTPUT FROM ${ip}:`, combinedOutput);
      throw new Error(`Connected successfully, but parser found 0 ports. RAW OUTPUT: ${combinedOutput.substring(0, 400)}`);
    }

    return NextResponse.json({ success: true, data: parsedPorts });

  } catch (error: any) {
    console.error(`SSH Error on ${ip}:`, error.message);
    ssh.dispose();
    
    return NextResponse.json({ 
      success: false, 
      error: `การเชื่อมต่อล้มเหลว (Connection Failed): ${error.message}` 
    }, { status: 500 });
  }
}

function parseDeviceOutput(portsStr: string, lldpStr: string, macStr: string, type: string) {
  const ports = [];
  const lines = portsStr.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // ขยายตัวกรองให้รองรับพอร์ต 10G (XGE/XGigabit), ท่อรวม (Eth-Trunk), และ VLAN (Vlanif)
    if (trimmed.match(/^(GE|Gi|GigabitEthernet|XGE|XGigabitEthernet|10GE|Eth-Trunk|Vlanif|MEth|Port|\d+\/)/i)) {
      const parts = trimmed.split(/\s+/);
      const portName = parts[0];
      
      const isUp = trimmed.toLowerCase().includes('up');
      
      let lldpName = '';
      if (lldpStr && lldpStr.includes(portName)) {
        const lldpLines = lldpStr.split('\n');
        const matchLine = lldpLines.find(l => l.includes(portName) && l.trim().length > portName.length + 5);
        if (matchLine) {
           const lParts = matchLine.trim().split(/\s+/);
           lldpName = lParts[lParts.length - 1]; 
           
           // If it grabs a number or status, it might be parsing the wrong column, clear it
           if (!isNaN(Number(lldpName)) || lldpName.toLowerCase() === 'up' || lldpName.toLowerCase() === 'down') {
               lldpName = '';
           }
        }
      }

      let mac = '';
      if (!lldpName) {
        const macLines = macStr.split('\n');
        const matchLine = macLines.find(l => l.includes(portName));
        if (matchLine) {
           const macMatch = matchLine.match(/([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})|([0-9a-fA-F]{4}[.-]){2}([0-9a-fA-F]{4})/);
           if (macMatch) mac = macMatch[0];
        }
      }

      ports.push({
        port: portName,
        status: isUp ? 'UP' : 'DOWN',
        speed: isUp ? (line.includes('10G') ? '10Gbps' : line.includes('100M') ? '100Mbps' : '1Gbps') : '--',
        type: portName.toLowerCase().includes('wan') || portName.includes('XGE') ? 'WAN/Uplink' : 'LAN',
        lldpName: lldpName || (isUp && mac ? 'Generic Device' : ''),
        mac: mac
      });
    }
  }

  return ports;
}

// Trigger rebuild
