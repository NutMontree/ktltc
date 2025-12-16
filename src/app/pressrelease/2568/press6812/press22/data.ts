// ชื่อข่าว และ การนำทาง (Pagination)
export const DataPressrelease = {
  Item: [{ title: `ข่าวประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์` }],

  // ***  Previous/Next  ***
  Pagination: {
    prev: {
      href: "/pressrelease/2568/press6812/press21",
    },
    next: {
      href: "/pressrelease/2568/press6812/press23",
    },
    // หมายเหตุ: หากไม่มีเรื่องก่อนหน้าหรือถัดไป ให้ใส่ค่าเป็น null เช่น prev: null
  },
};

// วันที่ลงข้อมูล
export const DataDate = [{ date: `10 ธันวาคม 2568` }];

// คำอธิบายข่าว
export const Description = [
  { description: `10 ธันวาคม วันรัฐธรรมนูญ` },
  {
    description: `พระบาทสมเด็จพระปกเกล้าเจ้าอยู่หัวพระราชทานรัฐธรรมนูญฉบับถาวรเเรกอันเป็นกฎหมายสูงสุดของประเทศให้กับประชาชนชาวไทย ในวันที่ 10 ธันวาคม 2475 หลังจากนั้นจึงถือเอาวันที่ 10 ธันวาคม ของทุกปีเป็น “วันรัฐธรรมนูญ”`,
  },
  // { description: `` },
  // { description: `` },
  // { description: `` },
  // { description: `` },
  // { description: `` },
];

// ลิงค์ (เอกสารดาวน์โหลด / ลิงค์ภายนอก)
export const TageLink = [
  // หากยังไม่มีลิงค์ ให้คอมเมนต์ไว้ หรือทำเป็นอาร์เรย์ว่าง [] เพื่อไม่ให้ปุ่มเปล่าแสดงหน้าเว็บ
  // {
  //   tage: `ดาวน์โหลดกำหนดการ`,
  //   href: `https://...`,
  // },
];

// รูปภาพ
export const ImageItem = [
  { imgs: "/images/ข่าวประชาสัมพันธ์/2568/ธันวาคม/22/00.webp" },
];
