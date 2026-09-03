import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Queue สำหรับจัดการการบันทึกข้อมูลทั่วไปลง DB อย่างช้าๆ ป้องกัน OOM
export const dbWriteQueue = new Queue('db-write', { connection });

// Queue สำหรับระบบบันทึกล็อก (ตัวอย่าง)
export const logQueue = new Queue('logs-write', { connection });
