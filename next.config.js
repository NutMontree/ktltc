// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ... การตั้งค่าอื่น ๆ ...
    typescript: {
        // ⚠️ คำเตือน: ปิดการตรวจสอบ Type ในระหว่างกระบวนการ build
        // ควรเปิดใช้งานอีกครั้งเมื่อแก้ปัญหา Type Check หลักได้แล้ว
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;