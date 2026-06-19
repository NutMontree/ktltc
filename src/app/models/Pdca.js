import mongoose, { Schema } from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PdcaSchema = new Schema(
  {
    year: String,
    department: String,
    namework: String,
    nameproject: String,
    // ✅ เพิ่มใหม่: เก็บไฟล์จริงเป็น Binary PDF ในฐานข้อมูล
    fileUrl: String,
    fileData: Buffer,
    fileType: String,
    originalFileName: String,
    attachments: [
      {
        fileUrl: String,
        originalFileName: String,
      }
    ],
    // ฟิลด์อื่น ๆ ตามที่ต้องการ
    id1: String,
    id2: String,
    id3: String,
    id4: String,
    id5: String,
    id6: String,
    id7: String,
    id8: String,
    id9: String,
    id10: String,
    id11: String,
    id12: String,
    id13: String,
    id14: String,
    id15: String,
    id16: String,
    id17: String,
    id18: String,
    id19: String,
    id20: String,
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.Pdca) delete mongoose.models.Pdca;
const Pdca = mongoose.model("Pdca", PdcaSchema);

export default Pdca;
