const net = require('net');

async function scanIP(ip, port = 27017, timeout = 250) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ ip, status: 'OPEN' });
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(null);
      }
    });

    socket.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        if (err.code === 'ECONNREFUSED') {
          resolve({ ip, status: 'REFUSED' }); // Refused means host is up, but port is closed (or active firewall)
        } else {
          resolve(null);
        }
      }
    });

    socket.connect(port, ip);
  });
}

async function runScan() {
  console.log("🚀 Starting Lenovo Server Subnet Scanner (Port 27017)...");
  
  const subnets = ['192.168.30', '192.168.6'];
  const activeHosts = [];

  for (const subnet of subnets) {
    console.log(`Scanning subnet ${subnet}.X...`);
    const promises = [];
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnet}.${i}`;
      promises.push(
        scanIP(ip).then((res) => {
          if (res) {
            console.log(`🔍 Found active host: ${res.ip} (${res.status})`);
            activeHosts.push(res);
          }
        })
      );
    }
    await Promise.all(promises);
  }

  console.log("\n=================== SCAN RESULTS ===================");
  if (activeHosts.length === 0) {
    console.log("❌ No Lenovo MongoDB server found on 192.168.30.X or 192.168.6.X subnets.");
  } else {
    console.log("✅ Found potential Lenovo MongoDB servers:");
    activeHosts.forEach(host => {
      console.log(` - IP: ${host.ip} [Port 27017: ${host.status}]`);
    });
  }
  console.log("====================================================");
}

runScan();
