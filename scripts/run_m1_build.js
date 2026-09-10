const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// 1. Load environment variables
const PROJECT_ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const taskId = process.argv[2] || `task-${Date.now()}`;
const STATUS_FILE = path.join(PROJECT_ROOT, 'scratch', 'm1_task_status.json');

// Ensure scratch directory exists
if (!fs.existsSync(path.join(PROJECT_ROOT, 'scratch'))) {
  try { fs.mkdirSync(path.join(PROJECT_ROOT, 'scratch'), { recursive: true }); } catch (e) {}
}

async function main() {
  const startTime = new Date();
  const logs = [
    `[${startTime.toLocaleTimeString('th-TH')}] ⚙️ เริ่มต้น Task ID: ${taskId}`,
    `ไดเรกทอรีทำงาน: ${PROJECT_ROOT}`,
    `คำสั่ง: npm run build && pm2 reload ktltc --update-env && pm2 save`,
    `--- ขั้นตอนที่ 1/2: กำลังคอมไพล์ Next.js Turbopack (npm run build) ---`
  ];

  let taskState = {
    id: taskId,
    command: 'npm run build && pm2 reload ktltc --update-env && pm2 save',
    status: 'running',
    step: 'compiling',
    stepMessage: 'ขั้นตอนที่ 1/2: กำลังคอมไพล์โค้ด Next.js Turbopack...',
    startedAt: startTime.toISOString(),
    completedAt: null,
    durationSeconds: 0,
    outputLogs: logs,
    exitCode: null,
    updatedAt: new Date().toISOString()
  };

  // Helper to persist task state to both MongoDB and scratch file
  let mongoClient = null;
  let tasksCol = null;

  try {
    const uri = process.env.MONGODB_URI;
    if (uri) {
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
      tasksCol = mongoClient.db('ktltc_db').collection('m1_tasks');
    }
  } catch (err) {
    console.error('MongoDB connect error in run_m1_build:', err.message);
  }

  async function syncState() {
    const elapsed = Math.round((Date.now() - startTime.getTime()) / 1000);
    taskState.durationSeconds = elapsed;
    taskState.updatedAt = new Date().toISOString();

    // 1. Sync to file
    try {
      fs.writeFileSync(STATUS_FILE, JSON.stringify(taskState, null, 2), 'utf-8');
    } catch (e) {}

    // 2. Sync to MongoDB
    if (tasksCol) {
      try {
        await tasksCol.updateOne(
          { id: taskId },
          { $set: taskState },
          { upsert: true }
        );
      } catch (e) {
        console.error('Failed to sync task to MongoDB:', e.message);
      }
    }
  }

  // Initial sync
  await syncState();

  // Run Step 1: npm run build
  const runBuild = () => {
    return new Promise((resolve) => {
      const child = spawn('npm', ['run', 'build'], {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin:/bin`,
          NODE_ENV: 'production'
        }
      });

      let buffer = '';

      const handleData = (chunk) => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            taskState.outputLogs.push(trimmed);
            if (taskState.outputLogs.length > 200) {
              taskState.outputLogs = taskState.outputLogs.slice(-200);
            }
          }
        }
        syncState().catch(() => {});
      };

      child.stdout.on('data', handleData);
      child.stderr.on('data', handleData);

      child.on('error', (err) => {
        taskState.outputLogs.push(`❌ Spawn error: ${err.message}`);
        resolve({ code: 1, error: err.message });
      });

      child.on('close', (code) => {
        if (buffer.trim()) {
          taskState.outputLogs.push(buffer.trim());
        }
        resolve({ code });
      });
    });
  };

  const buildResult = await runBuild();

  if (buildResult.code !== 0) {
    taskState.status = 'error';
    taskState.step = 'failed';
    taskState.stepMessage = `❌ การคอมไพล์โค้ดล้มเหลว (Exit code: ${buildResult.code})`;
    taskState.exitCode = buildResult.code;
    taskState.completedAt = new Date().toISOString();
    taskState.outputLogs.push(`--- ❌ Build failed with exit code ${buildResult.code} ---`);
    await syncState();
    if (mongoClient) await mongoClient.close().catch(() => {});
    process.exit(1);
  }

  // Step 2: PM2 Reload
  taskState.step = 'reloading';
  taskState.stepMessage = 'ขั้นตอนที่ 2/2: กำลังรีโหลด PM2 Cluster (4 instances) และบันทึกสถานะ...';
  taskState.outputLogs.push(`--- ขั้นตอนที่ 2/2: กำลังรีโหลด PM2 Cluster (pm2 reload ktltc --update-env && pm2 save) ---`);
  await syncState();

  const runPm2 = () => {
    return new Promise((resolve) => {
      const child = spawn('bash', ['-c', 'pm2 reload ktltc --update-env && pm2 save'], {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin:/bin`
        }
      });

      child.stdout.on('data', (d) => {
        const text = d.toString('utf-8').trim();
        if (text) taskState.outputLogs.push(...text.split('\n').filter(Boolean));
        syncState().catch(() => {});
      });

      child.stderr.on('data', (d) => {
        const text = d.toString('utf-8').trim();
        if (text) taskState.outputLogs.push(...text.split('\n').filter(Boolean));
        syncState().catch(() => {});
      });

      child.on('close', (code) => resolve({ code }));
    });
  };

  const pm2Result = await runPm2();

  const finalDuration = Math.round((Date.now() - startTime.getTime()) / 1000);
  taskState.durationSeconds = finalDuration;
  taskState.completedAt = new Date().toISOString();
  taskState.exitCode = pm2Result.code;

  if (pm2Result.code === 0) {
    taskState.status = 'success';
    taskState.step = 'complete';
    taskState.stepMessage = `✅ คอมไพล์และรีโหลดเซิร์ฟเวอร์สำเร็จสมบูรณ์ใน ${finalDuration} วินาที! หน้าเว็บอัปเดตเวอร์ชันใหม่แล้ว`;
    taskState.outputLogs.push(`--- ✅ สำเร็จสมบูรณ์ (Exit code: 0) ใช้เวลาทั้งหมด ${finalDuration} วินาที ---`);
  } else {
    taskState.status = 'error';
    taskState.step = 'failed';
    taskState.stepMessage = `❌ รีโหลด PM2 ล้มเหลว (Exit code: ${pm2Result.code})`;
    taskState.outputLogs.push(`--- ❌ PM2 reload failed with code ${pm2Result.code} ---`);
  }

  await syncState();
  if (mongoClient) await mongoClient.close().catch(() => {});
  process.exit(taskState.status === 'success' ? 0 : 1);
}

main().catch((e) => {
  console.error('Fatal error in run_m1_build:', e);
  process.exit(1);
});
