import { NextResponse } from 'next/server';
import { networkDevices } from '@/lib/networkDevices';
import { exec } from 'child_process';
import util from 'util';
import { NodeSSH } from 'node-ssh';

const execPromise = util.promisify(exec);

const isWin = process.platform === 'win32';

const pingDevice = async (ip: string): Promise<'online' | 'offline'> => {
  try {
    const cmd = isWin ? `ping -n 1 -w 800 ${ip}` : `ping -c 1 -W 1 ${ip}`;
    await execPromise(cmd);
    return 'online';
  } catch (error) {
    return 'offline';
  }
};

// Mapping of Device IP to Core Switch 8320 (192.168.6.3) Port
const corePortMapping: Record<string, string> = {
  '192.168.6.1': '1/1/48',  // Server Room (Huawei FW)
  '192.168.6.3': '1/1/48',  // Core Switch
  '192.168.6.14': '1/1/1',  // ตึกวิทยบริการ (Vitayaborigan)
  '192.168.6.12': '1/1/2',  // อาคารช่างกลโรงงาน (Chang_Kol)
  '192.168.6.15': '1/1/3',  // ตึกสามัญ (Samun)
  '192.168.6.11': '1/1/4',  // อาคารช่างเชื่อม+พื้นฐาน (chang_chem)
  '192.168.6.13': '1/1/5',  // อาคารช่างยนต์ (Chang_Yon)
  '192.168.6.17': '1/1/6',  // อาคารอิเล็กทรอนิกส์ (Chalermphakiat)
  '192.168.6.10': '1/1/7',  // ตึกอำนวยการ (Aumnuygan)
  '192.168.6.32': '1/1/9',  // ป้อมยาม (UPlink-To-YAM)
  '192.168.6.31': '1/1/10', // ตึกโดม (Uplink-To-DOME)
  '192.168.6.35': '1/1/11', // บ้านพักครู (Home-Techer)
  '192.168.6.210': '1/1/7', // อาคาร 4 (Cisco SG500-28)
};

// Cache previous counters to calculate exact Mbps delta (shared via Redis with memory fallback)
let memoryCounters: Record<string, { rx: number; tx: number; time: number }> = {};

async function getPrevCounters(): Promise<Record<string, { rx: number; tx: number; time: number }>> {
  try {
    const { redis } = await import('@/lib/redis');
    const data = await redis.get('nms:counters');
    if (data) return JSON.parse(data);
  } catch (err) {
    // Fallback to memory
  }
  return memoryCounters;
}

async function setPrevCounters(counters: Record<string, { rx: number; tx: number; time: number }>) {
  memoryCounters = counters;
  try {
    const { redis } = await import('@/lib/redis');
    await redis.set('nms:counters', JSON.stringify(counters), 'EX', 300);
  } catch (err) {
    // Fallback to memory
  }
}

async function fetchCoreSwitchBandwidth(): Promise<Record<string, { rx: number; tx: number }>> {
  const result: Record<string, { rx: number; tx: number }> = {};
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: '192.168.6.3',
      username: 'admin',
      password: 'Ktltc@33110',
      readyTimeout: 4000,
      algorithms: {
        kex: ['diffie-hellman-group1-sha1', 'diffie-hellman-group14-sha1', 'diffie-hellman-group-exchange-sha1', 'diffie-hellman-group-exchange-sha256', 'ecdh-sha2-nistp256'],
        cipher: ['aes128-cbc', 'aes256-cbc', 'aes128-ctr', 'aes256-ctr'],
        serverHostKey: ['ssh-rsa', 'ecdsa-sha2-nistp256']
      }
    });

    if (ssh.connection) ssh.connection.on('error', () => {});

    const shell = await ssh.requestShell();
    shell.on('error', () => {});

    let out = '';
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        try { shell.end(); ssh.dispose(); } catch (e) {}
        resolve();
      }, 4500);

      shell.on('data', (d: any) => { out += d.toString(); });

      setTimeout(() => {
        shell.write('no page\n');
        setTimeout(() => {
          shell.write('show interface 1/1/1,1/1/2,1/1/3,1/1/4,1/1/5,1/1/6,1/1/7,1/1/9,1/1/10,1/1/11,1/1/48\n');
          setTimeout(() => {
            clearTimeout(timer);
            try { shell.end(); ssh.dispose(); } catch (e) {}
            resolve();
          }, 1800);
        }, 300);
      }, 1500);
    });

    const now = Date.now();
    const currentCounters: Record<string, { rx: number; tx: number }> = {};

    const blocks = out.split(/Interface\s+/);
    for (const block of blocks) {
      const pMatch = block.match(/^(\d+\/\d+\/\d+)/);
      if (pMatch) {
        const port = pMatch[1];
        const rxMatch = block.match(/Rx[\s\S]*?(\d+)\s+total bytes/);
        const txMatch = block.match(/Tx[\s\S]*?(\d+)\s+total bytes/);
        currentCounters[port] = {
          rx: rxMatch ? Number(rxMatch[1]) : 0,
          tx: txMatch ? Number(txMatch[1]) : 0
        };
      }
    }

    const prevCounters = await getPrevCounters();
    const nextCounters: Record<string, { rx: number; tx: number; time: number }> = { ...prevCounters };

    for (const [ip, port] of Object.entries(corePortMapping)) {
      const curr = currentCounters[port];
      const prev = prevCounters[port];

      if (curr && prev && prev.time > 0) {
        const dt = Math.max(1, (now - prev.time) / 1000);
        const dRx = Math.max(0, curr.rx - prev.rx);
        const dTx = Math.max(0, curr.tx - prev.tx);

        // For buildings: Download = Core Tx, Upload = Core Rx
        // For Firewall (192.168.6.1): Download = Core Rx, Upload = Core Tx
        const isFw = ip === '192.168.6.1';
        const dlBytes = isFw ? dRx : dTx;
        const ulBytes = isFw ? dTx : dRx;

        let dlMbps = Number((dlBytes * 8 / (dt * 1000000)).toFixed(1));
        let ulMbps = Number((ulBytes * 8 / (dt * 1000000)).toFixed(1));

        result[ip] = { rx: dlMbps, tx: ulMbps };
      } else if (curr && curr.rx > 0) {
        // Initial sample baseline before first delta
        result[ip] = { rx: 0.1, tx: 0.1 };
      } else {
        result[ip] = { rx: 0, tx: 0 };
      }

      if (curr) {
        nextCounters[port] = { rx: curr.rx, tx: curr.tx, time: now };
      }
    }

    // Save updated counters to shared cache
    await setPrevCounters(nextCounters);

    // Calculate aggregate traffic for Core Switch (sum of all buildings)
    let totalBuildingDl = 0;
    let totalBuildingUl = 0;
    for (const [devIp, val] of Object.entries(result)) {
      if (devIp !== '192.168.6.1' && devIp !== '192.168.6.3') {
        totalBuildingDl += val.rx;
        totalBuildingUl += val.tx;
      }
    }
    result['192.168.6.3'] = {
      rx: Number(totalBuildingDl.toFixed(1)),
      tx: Number(totalBuildingUl.toFixed(1))
    };
  } catch (err) {
    // Graceful fallback on SSH error
  }

  return result;
}

export async function GET() {
  try {
    // WAN Circuits to monitor
    const wanTargets = [
      { id: 'uninet', name: 'UNINET', ip: '202.29.224.34' },
      { id: 'cat', name: 'วงจร CAT (NT)', ip: '122.154.155.45' }
    ];

    // Run ping scan, WAN check, and Core Switch bandwidth fetch in parallel
    const [bandwidthMap, pingStatuses, wanStatuses] = await Promise.all([
      fetchCoreSwitchBandwidth(),
      Promise.all(networkDevices.map(async (device) => ({
        id: device.id,
        status: await pingDevice(device.ip)
      }))),
      Promise.all(wanTargets.map(async (wan) => ({
        ...wan,
        status: await pingDevice(wan.ip)
      })))
    ]);

    const statusMap = Object.fromEntries(pingStatuses.map(s => [s.id, s.status]));

    const results = networkDevices.map((device) => {
      const status = statusMap[device.id] || 'offline';
      const bw = status === 'online' ? (bandwidthMap[device.ip] || { rx: 0, tx: 0 }) : { rx: 0, tx: 0 };

      return {
        ...device,
        status,
        rx: bw.rx,
        tx: bw.tx
      };
    });

    return NextResponse.json({ success: true, data: results, wanCircuits: wanStatuses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
