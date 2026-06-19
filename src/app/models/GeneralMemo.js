import mongoose, { Schema } from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
}

// Global cached connection for Serverless Environment (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("MongoDB connected (GeneralMemo)");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
connectDB();

const GeneralMemoSchema = new Schema(
  {
    docNumber: { type: String, default: "" },
    date: { type: String, default: "" },
    department: { type: String, default: "วิทยาลัยเทคนิคกันทรลักษ์" },
    subject: { type: String, default: "" },
    salutation: { type: String, default: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์" },
    paragraphs: {
      type: [String],
      default: [
        "ด้วยแผนกวิชา... มีความประสงค์ที่จะ... เพื่อใช้ใน...",
        "ในการนี้ แผนกวิชา...",
        "จึงเรียนมาเพื่อโปรดพิจารณา...",
      ],
    },

    // Signatures
    signerName: { type: String, default: "" },
    signerPosition: { type: String, default: "หัวหน้างาน/หัวหน้าแผนก" },
    deputyName: { type: String, default: "นายสมศักดิ์ จันทนิตย์" },
    deputyPosition: { type: String, default: "รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน" },
    directorName: { type: String, default: "นางสาวทักษิณา ชมจันทร์" },

    footerText: { type: String, default: "" },

    // Auth Information
    userId: { type: String },
    authorName: { type: String },
    authorImage: { type: String },
    authorRole: { type: String },
  },
  {
    timestamps: true,
  },
);

const GeneralMemo = mongoose.models.GeneralMemo || mongoose.model("GeneralMemo", GeneralMemoSchema);

export default GeneralMemo;
