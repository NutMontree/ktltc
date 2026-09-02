import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import clientPromise from '../lib/db';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

// Initialize Worker for processing DB writes asynchronously
const worker = new Worker('db-write', async (job) => {
  const { collection, operation, data, filter } = job.data;
  const client = await clientPromise;
  const db = client.db("ktltc_db");
  const col = db.collection(collection);

  console.log(`[Worker] Processing ${operation} on ${collection} (Job: ${job.id})`);

  try {
    switch (operation) {
      case 'insertOne':
        await col.insertOne(data);
        break;
      case 'updateOne':
        await col.updateOne(filter, { $set: data });
        break;
      case 'updateMany':
        await col.updateMany(filter, { $set: data });
        break;
      default:
        console.warn(`[Worker] Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error(`[Worker] DB Error:`, error);
    throw error;
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err);
});

console.log('[Worker] dbWorker is running and listening to db-write queue...');
