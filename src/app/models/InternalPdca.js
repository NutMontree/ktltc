import mongoose from "mongoose";

// Connection logic
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { maxPoolSize: 50 }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const InternalPdcaSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    department: { type: String, required: true },
    namework: { type: String, required: true },
    nameproject: { type: String, required: true },
    pdcaLink: { type: String },
    fileUrl: [{ type: String }],
    originalFileName: [{ type: String }],
    userId: String,
    authorName: String,
    authorImage: String,
    authorRole: String,
    // Steps 1-11
    id1: String, id2: String, id3: String, id4: String, id5: String,
    id6: String, id7: String, id8: String, id9: String, id10: String, id11: String,
    id12: String, id13: String, id14: String, id15: String, id16: String, id17: String,
    id18: String, id19: String, id20: String, id21: String, id22: String, id23: String,
    id24: String, id25: String, id26: String, id27: String, id28: String, id29: String, id30: String,
    // Per-item PDF attachments (URL and original file name for each step)
    pdf1: String, pdf2: String, pdf3: String, pdf4: String, pdf5: String,
    pdf6: String, pdf7: String, pdf8: String, pdf9: String, pdf10: String, pdf11: String,
    pdf12: String, pdf13: String, pdf14: String, pdf15: String, pdf16: String, pdf17: String,
    pdf18: String, pdf19: String, pdf20: String, pdf21: String, pdf22: String, pdf23: String,
    pdf24: String, pdf25: String, pdf26: String, pdf27: String, pdf28: String, pdf29: String, pdf30: String,
    pdfName1: String, pdfName2: String, pdfName3: String, pdfName4: String, pdfName5: String,
    pdfName6: String, pdfName7: String, pdfName8: String, pdfName9: String, pdfName10: String, pdfName11: String,
    pdfName12: String, pdfName13: String, pdfName14: String, pdfName15: String, pdfName16: String, pdfName17: String,
    pdfName18: String, pdfName19: String, pdfName20: String, pdfName21: String, pdfName22: String, pdfName23: String,
    pdfName24: String, pdfName25: String, pdfName26: String, pdfName27: String, pdfName28: String, pdfName29: String, pdfName30: String,
  },
  { timestamps: true }
);

delete mongoose.models.InternalPdca;
const InternalPdca = mongoose.model("InternalPdca", InternalPdcaSchema);

export { connectDB };
export default InternalPdca;
