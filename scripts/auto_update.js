const { execSync } = require('child_process');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

async function autoUpdate() {
  console.log('--- Starting Auto-Update Check ---');
  let hasUpdates = false;
  let logs = [];
  
  try {
    // Check git status
    execSync('git remote update', { encoding: 'utf-8' });
    const status = execSync('git status -uno', { encoding: 'utf-8' });
    
    if (status.includes('Your branch is behind')) {
      hasUpdates = true;
      console.log('Updates found. Pulling latest changes...');
      
      // Zero-downtime update process
      logs.push(execSync('git pull', { encoding: 'utf-8' }));
      console.log('Installing dependencies...');
      logs.push(execSync('npm install', { encoding: 'utf-8' }));
      console.log('Building project...');
      logs.push(execSync('npm run build', { encoding: 'utf-8' }));
      console.log('Reloading PM2 instances (Zero-Downtime)...');
      logs.push(execSync('pm2 reload ktltc', { encoding: 'utf-8' }));
      logs.push(execSync('pm2 save', { encoding: 'utf-8' }));
      
      console.log('Auto-update completed successfully.');
    } else {
      console.log('System is already up to date.');
      return; // No updates, exit silently.
    }
  } catch (error) {
    console.error('Auto-update failed:', error.message);
    logs.push(`Error: ${error.message}`);
  }

  // Send Notification if updates occurred or failed
  if (hasUpdates) {
    let mongoClient;
    try {
      const uri = process.env.MONGODB_URI;
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
      const db = mongoClient.db("ktltc_db");
      
      const adminRoles = ["super_admin", "admin", "director", "deputy_director"];
      const targetUsers = await db.collection("users").find({ role: { $in: adminRoles } }).project({ _id: 1 }).toArray();
      
      if (targetUsers.length > 0) {
        const notifications = targetUsers.map(user => ({
          userId: user._id,
          type: "system_update",
          title: "🚀 ระบบอัปเดตอัตโนมัติสำเร็จ",
          message: "ระบบตรวจสอบพบโค้ดใหม่และทำการอัปเดต (Build & Zero-Downtime Reload) เรียบร้อยแล้ว",
          from: "SYSTEM",
          fromName: "System",
          targetUrl: "#",
          isRead: false,
          read: false,
          createdAt: new Date(),
        }));
        await db.collection("notifications").insertMany(notifications);
        console.log('Update notification sent.');
      }
    } catch (dbError) {
      console.error('Failed to send update notification:', dbError.message);
    } finally {
      if (mongoClient) await mongoClient.close();
    }
  }
}

autoUpdate().catch(console.error);
