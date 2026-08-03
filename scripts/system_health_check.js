const { execSync } = require('child_process');
const http = require('http');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

async function checkSystem() {
  console.log('--- Starting System Health Check ---');
  let issues = [];
  let isHealed = false;

  // 1. Check PM2 Instances
  try {
    const pm2List = JSON.parse(execSync('pm2 jlist', { encoding: 'utf-8' }));
    const ktltcProcesses = pm2List.filter(p => p.name === 'ktltc');
    
    if (ktltcProcesses.length === 0) {
      issues.push('No ktltc PM2 processes found.');
    } else {
      let offlineCount = 0;
      ktltcProcesses.forEach(p => {
        if (p.pm2_env.status !== 'online') {
          offlineCount++;
        }
      });
      if (offlineCount > 0 || ktltcProcesses.length < 4) {
        issues.push(`${offlineCount} processes offline or less than 4 processes running (found ${ktltcProcesses.length}).`);
      }
    }
  } catch (error) {
    issues.push('Failed to check PM2 status: ' + error.message);
  }

  // 2. Check HTTP Health
  const checkHttp = () => {
    return new Promise((resolve) => {
      http.get('http://localhost:3000', (res) => {
        if (res.statusCode !== 200 && res.statusCode !== 308) {
           resolve(false);
        } else {
           resolve(true);
        }
      }).on('error', (e) => {
        resolve(false);
      });
    });
  };

  const isHttpOk = await checkHttp();
  if (!isHttpOk) {
    issues.push('HTTP endpoint is not responding properly.');
  }

  // 3. Check MongoDB
  let mongoClient;
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in .env');
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    await mongoClient.db("ktltc_db").command({ ping: 1 });
  } catch (error) {
    issues.push('MongoDB connection failed: ' + error.message);
  }

  // 4. Auto-Healing
  if (issues.length > 0) {
    console.log('Issues found:', issues);
    console.log('Attempting auto-healing...');
    try {
      execSync('pm2 restart ktltc', { encoding: 'utf-8' });
      isHealed = true;
      console.log('Successfully restarted PM2 processes.');
    } catch (e) {
      console.error('Auto-healing failed:', e.message);
    }
  } else {
    console.log('System is healthy.');
  }

  // 5. Send Notification
  try {
    if (!mongoClient) {
      const uri = process.env.MONGODB_URI;
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
    }
    const db = mongoClient.db("ktltc_db");
    const adminRoles = ["super_admin", "admin", "director", "deputy_director"];
    const targetUsers = await db.collection("users").find({ role: { $in: adminRoles } }).project({ _id: 1 }).toArray();
    
    if (targetUsers.length > 0) {
      let title, message, type;
      if (issues.length > 0) {
        title = "⚠️ System Auto-Healing Triggered";
        message = `พบปัญหา: ${issues.join(', ')}. ระบบ${isHealed ? 'ได้รับการซ่อมแซมเบื้องต้นแล้ว (Restarted PM2)' : 'พยายามซ่อมแซมแต่ไม่สำเร็จ'}`;
        type = "system_alert";
      } else {
        console.log('Skipping daily success notification to avoid spam.');
        return; 
      }

      const notifications = targetUsers.map(user => ({
        userId: user._id,
        type: type,
        title: title,
        message: message,
        from: "SYSTEM",
        fromName: "System",
        targetUrl: "#",
        isRead: false,
        read: false,
        createdAt: new Date(),
      }));

      await db.collection("notifications").insertMany(notifications);
      console.log('Notification sent successfully.');
    }
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

checkSystem().catch(console.error);
