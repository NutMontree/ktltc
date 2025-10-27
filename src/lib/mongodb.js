import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("⚠️ กรุณาตั้งค่า MONGODB_URI ในไฟล์ .env.local");
}

let isConnected = false; // ป้องกันการเชื่อมต่อซ้ำ

export const connectMongoDB = async () => {
    if (isConnected) return;

    try {
        const db = await mongoose.connect(MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
};
