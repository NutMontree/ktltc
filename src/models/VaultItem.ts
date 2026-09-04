import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export interface IVaultCredential {
  id: string; // Unique ID สำหรับ credential นี้ใน array (ใช้ uuid หรือ string สุ่ม)
  title: string;          // ชื่อบัญชี/บริการ เช่น Facebook
  username: string;       // ชื่อผู้ใช้งาน/อีเมล
  encryptedPassword: string; // รหัสผ่านที่เข้ารหัสแล้ว
  createdAt: Date;
}

export interface IVaultFolder {
  _id?: ObjectId;
  userId: ObjectId;
  folderName: string;     // ชื่อแฟ้ม เช่น KTLTC
  credentials: IVaultCredential[];
  createdAt: Date;
  updatedAt: Date;
  ownerName?: string;     // สำหร้บโหมดดูทั้งหมด
  ownerEmail?: string;
}

export async function getVaultCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || "ktltc");
  return db.collection<IVaultFolder>("vault_items");
}
