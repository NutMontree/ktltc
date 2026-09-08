import snmp from 'net-snmp';
import { NodeSSH } from 'node-ssh';

// In-memory cache for Firewall ARP table (2 minutes TTL)
let arpCache: Record<string, string> = {};
let lastArpFetchTime = 0;

async function getFirewallArpTable(): Promise<Record<string, string>> {
  const now = Date.now();
  if (Object.keys(arpCache).length > 0 && (now - lastArpFetchTime < 120000)) {
    return arpCache;
  }

  const map: Record<string, string> = {};
  try {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: '192.168.6.1',
      username: 'nut',
      password: 'Nut29122539',
      readyTimeout: 3000
    });

    if (ssh.connection) {
      ssh.connection.on('error', () => {});
    }

    const shell = await ssh.requestShell();
    shell.on('error', () => {});

    let out = '';
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        try { shell.end(); ssh.dispose(); } catch (e) {}
        resolve();
      }, 4000);

      shell.on('data', (d: any) => {
        out += d.toString();
      });

      setTimeout(() => {
        shell.write('screen-length 0 temporary\n');
        setTimeout(() => {
          shell.write('display arp all\n');
          setTimeout(() => {
            clearTimeout(timer);
            try { shell.end(); ssh.dispose(); } catch (e) {}
            resolve();
          }, 1500);
        }, 300);
      }, 1500);
    });

    const lines = out.split('\n');
    for (const line of lines) {
      const match = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4})/);
      if (match) {
        const ip = match[1];
        const macClean = match[2].replace(/-/g, '').toLowerCase();
        map[macClean] = ip;
      }
    }

    if (Object.keys(map).length > 0) {
      arpCache = map;
      lastArpFetchTime = now;
    }
  } catch (err) {
    // If firewall ARP fetch fails, return existing cache or empty map without failing request
  }

  return Object.keys(map).length > 0 ? map : arpCache;
}

export async function getSNMPPorts(ip: string): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    const session = snmp.createSession(ip, "public", { version: snmp.Version2c, timeout: 3000, retries: 1 });
    const portsMap: Record<string, any> = {};
    const lldpNames: Record<number, string> = {};
    const lldpIps: Record<number, string> = {};
    const macMap: Record<number, string[]> = {};

    // 1. Fetch Interface Table (Name, Speed, Status)
    const fetchColumns = [2, 5, 8].map((colIndex) => {
      return new Promise<void>((res) => {
        session.subtree(`1.3.6.1.2.1.2.2.1.${colIndex}`, 20, (varbinds) => {
          for (const vb of varbinds) {
            const oidStr = vb.oid.toString();
            const parts = oidStr.split('.');
            const index = parts[parts.length - 1];
            
            if (!portsMap[index]) portsMap[index] = {};
            
            if (colIndex === 2) portsMap[index].name = vb.value.toString('utf8');
            if (colIndex === 5) portsMap[index].speed = vb.value;
            if (colIndex === 8) portsMap[index].status = vb.value;
          }
        }, () => res());
      });
    });

    // 2. Fetch LLDP System Names (1.0.8802.1.1.2.1.4.1.1.9)
    const fetchLldpNames = new Promise<void>((res) => {
      session.subtree('1.0.8802.1.1.2.1.4.1.1.9', 20, (vbs) => {
        for (const vb of vbs) {
          const parts = vb.oid.split('.');
          const portNum = parseInt(parts[parts.length - 2], 10);
          const name = vb.value.toString('utf8').trim();
          if (name) lldpNames[portNum] = name;
        }
      }, () => res());
    });

    // 3. Fetch LLDP Management IPs (1.0.8802.1.1.2.1.4.2.1.3)
    const fetchLldpIps = new Promise<void>((res) => {
      session.subtree('1.0.8802.1.1.2.1.4.2.1.3', 20, (vbs) => {
        for (const vb of vbs) {
          const parts = vb.oid.split('.');
          const neighborIp = parts.slice(parts.length - 4).join('.');
          const portNum = parseInt(parts[parts.length - 8], 10);
          if (neighborIp) lldpIps[portNum] = neighborIp;
        }
      }, () => res());
    });

    // 4. Fetch Bridge FDB MAC Address Table (1.3.6.1.2.1.17.4.3.1.2)
    const fetchMacTable = new Promise<void>((res) => {
      session.subtree('1.3.6.1.2.1.17.4.3.1.2', 20, (vbs) => {
        for (const vb of vbs) {
          const portNum = vb.value;
          const parts = vb.oid.split('.');
          const macHex = parts.slice(parts.length - 6).map((d: string) => parseInt(d, 10).toString(16).padStart(2, '0')).join(':');
          if (!macMap[portNum]) macMap[portNum] = [];
          macMap[portNum].push(macHex);
        }
      }, () => res());
    });

    // Run SNMP walks and Firewall ARP fetch in parallel
    const [arpMap] = await Promise.all([
      getFirewallArpTable(),
      Promise.all([...fetchColumns, fetchLldpNames, fetchLldpIps, fetchMacTable])
    ]);

    session.close();

    const physicalList: any[] = [];

    for (const index in portsMap) {
      const numIdx = parseInt(index, 10);
      const row = portsMap[index];
      const rawName = (row.name || '').trim();
      const portNum = parseInt(rawName, 10);
      const isUp = row.status === 1;

      // Filter to physical switch ports 1 to 28
      if (numIdx >= 1 && numIdx <= 64 && !isNaN(portNum) && portNum >= 1 && portNum <= 28) {
        const isSFP = portNum >= 25;
        let speedStr = '--';
        if (isUp) {
          const speed = row.speed || 0;
          if (speed >= 4294000000) speedStr = '10Gbps';
          else if (speed === 1000000000) speedStr = '1Gbps';
          else if (speed === 100000000) speedStr = '100Mbps';
          else if (speed === 10000000) speedStr = '10Mbps';
          else if (speed > 0) speedStr = `${speed / 1000000}Mbps`;
        }

        const lldpName = lldpNames[portNum] || lldpNames[numIdx] || '';
        const lldpIp = lldpIps[portNum] || lldpIps[numIdx] || '';
        const portMacs = macMap[portNum] || macMap[numIdx] || [];
        const primaryMac = portMacs[0] || '';

        // Match IP: LLDP IP takes first priority, then match MAC in ARP table
        let resolvedIp = lldpIp;
        if (!resolvedIp && primaryMac) {
          const macClean = primaryMac.replace(/:/g, '').toLowerCase();
          resolvedIp = arpMap[macClean] || '';
        }

        // Determine Device Type and Friendly Display Label
        let deviceType = 'LAN';
        let displayLabel = '';

        if (isSFP || lldpName.toLowerCase().includes('coresw') || lldpName.toLowerCase().includes('8320')) {
          deviceType = 'Uplink';
          displayLabel = lldpName ? `🔌 ${lldpName}` : '🔌 Core Switch (Uplink)';
          if (!resolvedIp) resolvedIp = '192.168.6.3';
        } else if (lldpName || primaryMac.startsWith('9c:8c:d8') || primaryMac.startsWith('8c:79:09')) {
          deviceType = 'Wi-Fi AP';
          const apName = lldpName || 'Ruijie AP';
          displayLabel = `📶 ${apName}${resolvedIp ? ` (${resolvedIp})` : ''}`;
        } else if (isUp) {
          deviceType = 'LAN';
          if (portMacs.length > 1) {
            displayLabel = `💻 สวิตช์ย่อย (${portMacs.length} อุปกรณ์)`;
          } else if (resolvedIp) {
            displayLabel = `💻 PC (${resolvedIp})`;
          } else if (primaryMac) {
            displayLabel = `💻 LAN (${primaryMac})`;
          }
        }

        physicalList.push({
          portNum,
          port: isSFP ? `Port ${portNum} (SFP+)` : `Port ${portNum}`,
          status: isUp ? 'UP' : 'DOWN',
          speed: speedStr,
          type: isSFP ? 'WAN/Uplink' : deviceType === 'Wi-Fi AP' ? 'Wi-Fi AP' : 'LAN',
          deviceType,
          lldpName: displayLabel,
          deviceName: lldpName || (deviceType === 'Wi-Fi AP' ? 'Ruijie AP' : isUp ? 'คอมพิวเตอร์ / LAN Device' : ''),
          ip: resolvedIp,
          mac: primaryMac,
          allMacs: portMacs
        });
      }
    }

    physicalList.sort((a, b) => a.portNum - b.portNum);
    resolve(physicalList);
  });
}
