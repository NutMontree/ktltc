import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IChatLog extends Document {
  sessionId: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  keywords?: string[];
  intent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ChatLogSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'ai', 'system'], required: true },
    content: { type: String, required: true },
    keywords: [{ type: String }],
    intent: { type: String },
    metadata: { type: Schema.Types.Mixed }, // เก็บข้อมูลเพิ่มเติมเผื่ออนาคต
  },
  {
    timestamps: true, // เพิ่ม createdAt, updatedAt อัตโนมัติ
  }
);

// สร้าง Text Index สำหรับ content เพื่อให้ค้นหาข้อความได้ง่ายตอนเอาไปเทรน
ChatLogSchema.index({ content: 'text' });

export const ChatLog: Model<IChatLog> =
  mongoose.models.ChatLog || mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
