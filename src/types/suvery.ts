// src/components/suveryList.tsx

// 💡 กำหนด Type สำหรับข้อมูล suvery
// เราใช้ Partial<Record<string, any>> เพื่อให้ Type เข้ากันได้กับโครงสร้าง Mongoose Schema ที่ซับซ้อนและ Dynamic
// อย่างไรก็ตาม การกำหนด Type ให้ละเอียดจะดีที่สุด แต่เพื่อแก้ error เร่งด่วน เราจะกำหนด Field สำคัญก่อน
export interface Isuvery {
    _id: string;
    studentId: string;
    fullName: string;
    graduationYear: number;
    currentStatus: string; // '1' หรือ '2'
    submittedAt: string; // ISO Date string
    // เพิ่ม Field อื่นๆ ที่คุณต้องการใช้ใน Modal หรือ List ที่นี่
    [key: string]: any; // ใช้สำหรับ Field อื่นๆ ที่ไม่ได้ระบุชัดเจน
}

// 💡 กำหนด Type สำหรับ Props ของ suveryListItem
interface suveryListItemProps {
    suvery: Isuvery;
    onDetailClick: (suvery: Isuvery) => void;
}

// 💡 กำหนด Type สำหรับ Props ของ suveryList หลัก
interface suveryListProps {
    suverys: Isuvery[];
}

// -----------------------------------------------------------