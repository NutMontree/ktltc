#!/usr/bin/env node
/**
 * scripts/network_watchdog.js
 * 
 * Background Network Outage Watchdog & Alert Engine (KTLTC Agent M1)
 * ตรวจสอบสถานะการเชื่อมต่ออินเทอร์เน็ตและเครือข่ายหลักของวิทยาลัย
 * หากเกิดเหตุขัดข้อง (Internet Down) จะส่งการแจ้งเตือนด่วนเข้าสู่ระบบ Notification บนเว็บไซต์ KTLTC ทันที
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

const execAsync = promisify(exec);
const PROJECT_ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin";
const DB_NAME = "ktltc_db";

const TARGETS = [
  { name: "Google DNS", ip: "8.8.8.8", role: "internet" },
  { name: "UNINET WAN", ip: "202.29.224.34", role: "wan" },
  { name: "HUAWEI Firewall Gateway", ip: "192.168.6.1", role: "gateway" },
  { name: "Aruba 8320 Core Switch", ip: "192.168.6.3", role: "core" },
];

async function pingTarget(ip) {
  try {
    const { stdout } = await execAsync(`ping -c 2 -W 1.5 ${ip}`);
    const timeMatch = stdout.match(/time=([0-9.]+)\s*ms/);
    const latency = timeMatch ? parseFloat(timeMatch[1]) : 1;
    return { ok: true, latency };
  } catch {
    return { ok: false, latency: null };
  }
}

async function sendNotificationToAdmins(client, { type, title, message }) {
  const db = client.db(DB_NAME);
  const adminRoles = ["super_admin", "admin", "director", "deputy_director"];
  
  const admins = await db.collection("users").find({
    role: { $in: adminRoles }
  }).project({ _id: 1, name: 1, email: 1, role: 1 }).toArray();

  if (!admins || admins.length === 0) {
    console.warn("[Watchdog] No admin users found to notify.");
    return 0;
  }

  const notifications = admins.map(user => ({
    userId: user._id,
    type: type || "network_alert",
    title: title,
    message: message,
    from: "Agent M1",
    fromName: "Agent M1 (Network AI)",
    targetUrl: "/network-monitor",
    isRead: false,
    read: false,
    createdAt: new Date(),
  }));

  const result = await db.collection("notifications").insertMany(notifications);
  console.log(`[Watchdog] Successfully sent notification to ${result.insertedCount} administrators.`);
  return result.insertedCount;
}

async function main() {
  const isTest = process.argv.includes("--test");
  const isLoop = process.argv.includes("--daemon") || process.argv.includes("--loop");

  console.log(`[Watchdog] Starting Network Outage Watchdog (PID: ${process.pid}, TestMode: ${isTest})...`);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const stateCol = db.collection("network_watchdog_state");

  const runCheck = async () => {
    try {
      const results = {};
      for (const t of TARGETS) {
        results[t.ip] = await pingTarget(t.ip);
      }

      const internetOk = results["8.8.8.8"].ok || results["202.29.224.34"].ok;
      const gatewayOk = results["192.168.6.1"].ok;
      const coreOk = results["192.168.6.3"].ok;

      console.log(`[Watchdog] Ping Status - Internet(8.8.8.8): ${results["8.8.8.8"].ok ? 'UP' : 'DOWN'}, UNINET: ${results["202.29.224.34"].ok ? 'UP' : 'DOWN'}, Gateway: ${gatewayOk ? 'UP' : 'DOWN'}, Core: ${coreOk ? 'UP' : 'DOWN'}`);

      // Handle Test Mode
      if (isTest) {
        console.log("[Watchdog] Running test alert injection...");
        await sendNotificationToAdmins(client, {
          type: "network_alert",
          title: "🚨 [ทดสอบระบบ] แจ้งเตือนระบบเครือข่ายและอินเทอร์เน็ต KTLTC",
          message: "Agent M1 กำลังทดสอบระบบส่งการแจ้งเตือน Network Outage Notification ไปยังกระดิ่งของ Super Admin (ระบบทำงานปกติ)",
        });
        return;
      }

      // Read current persistent watchdog state
      let state = await stateCol.findOne({ id: "global_network_state" });
      if (!state) {
        state = { id: "global_network_state", isDown: false, lastDownAt: null, lastAlertAt: null, lastRecoverAt: null };
        await stateCol.insertOne(state);
      }

      const now = new Date();
      const COOLDOWN_MINUTES = 15;

      // 1. If Internet is Down
      if (!internetOk) {
        console.warn("[Watchdog] ⚠️ CRITICAL: Internet connection is DOWN!");
        
        let shouldAlert = false;
        if (!state.isDown) {
          shouldAlert = true; // State changed from UP to DOWN
        } else if (state.lastAlertAt) {
          const minutesSinceLastAlert = (now.getTime() - new Date(state.lastAlertAt).getTime()) / (1000 * 60);
          if (minutesSinceLastAlert >= COOLDOWN_MINUTES) {
            shouldAlert = true;
          }
        }

        if (shouldAlert) {
          const failureCause = !gatewayOk 
            ? "ไฟร์วอลล์หลัก (Huawei USG6525E 192.168.6.1) ขัดข้อง ไม่ตอบสนอง" 
            : (!coreOk ? "Aruba 8320 Core Switch (192.168.6.3) ไม่ตอบสนอง" : "วงจร WAN ภายนอก (UNINET 202.29.224.34) หลุดหรือไม่สามารถเชื่อมต่อไปยังอินเทอร์เน็ตภายนอกได้");

          await sendNotificationToAdmins(client, {
            type: "network_alert",
            title: "🚨 แจ้งเตือนด่วน: ระบบอินเทอร์เน็ต KTLTC ขัดข้อง",
            message: `Agent M1 ตรวจพบว่าอินเทอร์เน็ตไม่สามารถใช้งานได้ สาเหตุ: ${failureCause} กรุณาตรวจสอบสถานะผ่าน Network Monitor`,
          });

          await stateCol.updateOne(
            { id: "global_network_state" },
            { 
              $set: { 
                isDown: true, 
                lastDownAt: state.isDown ? state.lastDownAt : now, 
                lastAlertAt: now,
                failureCause 
              } 
            }
          );
        }
      } 
      // 2. If Internet is Recovered
      else if (state.isDown) {
        console.log("[Watchdog] ✅ RECOVERY: Internet connection has recovered!");

        const downDurationMinutes = state.lastDownAt 
          ? Math.round((now.getTime() - new Date(state.lastDownAt).getTime()) / (1000 * 60))
          : 0;

        await sendNotificationToAdmins(client, {
          type: "network_alert",
          title: "✅ ระบบอินเทอร์เน็ต KTLTC กลับมาใช้งานได้ตามปกติแล้ว",
          message: `วงจรเชื่อมต่อภายนอก (WAN) และอินเทอร์เน็ตกลับมาทำงานปกติแล้ว (ระยะเวลาขัดข้องประมาณ ${downDurationMinutes} นาที)`,
        });

        await stateCol.updateOne(
          { id: "global_network_state" },
          { 
            $set: { 
              isDown: false, 
              lastRecoverAt: now,
              failureCause: null 
            } 
          }
        );
      }
    } catch (err) {
      console.error("[Watchdog] Check iteration error:", err);
    }
  };

  await runCheck();

  if (isLoop && !isTest) {
    console.log("[Watchdog] Running continuously every 45 seconds...");
    setInterval(runCheck, 45000);
  } else {
    await client.close();
    process.exit(0);
  }
}

main().catch(err => {
  console.error("[Watchdog] Fatal error:", err);
  process.exit(1);
});
