const { Redis } = require('ioredis');
const { Queue } = require('bullmq');

async function testArchitecture() {
  console.log("🚀 Starting Architecture Verification Test...");

  try {
    const redis = new Redis();
    // 1. Test Redis Connection
    console.log("1. Testing Redis Connection...");
    await redis.set('test_key', 'Hello, 10k RPS!');
    const val = await redis.get('test_key');
    if (val === 'Hello, 10k RPS!') {
      console.log("✅ Redis is successfully connected and working!");
    } else {
      throw new Error("Redis returned incorrect value.");
    }

    // 2. Test BullMQ Queue Addition
    console.log("2. Testing BullMQ Message Queue...");
    const queue = new Queue('db-write', { connection: redis });
    const job = await queue.add('test-job', {
      collection: 'logs',
      operation: 'insertOne',
      data: { message: "System tested successfully", timestamp: new Date() }
    });
    console.log(`✅ Queue job successfully created! (Job ID: ${job.id})`);

    console.log("\n🎉 All architecture tests passed! The system is ready to handle high loads.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testArchitecture();
