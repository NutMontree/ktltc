"use client";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion } from "framer-motion";

export default function page() {
  return (
    <>
      <div className="space-y-20 overflow-hidden">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center bg-linear-to-b from-blue-50 to-white py-20 text-center"
        >
          <motion.h1
            className="text-4xl font-bold text-gray-800"
            whileHover={{ scale: 1.05 }}
          >
            ยินดีต้อนรับสู่ KTLTC
          </motion.h1>
          <motion.div
            className="mt-4 text-lg text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            วิทยาลัยเทคนิคกันทรลักษ์
          </motion.div>
        </motion.section>

        {/* Press Release Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="mb-10 text-center text-2xl font-semibold">
            ข่าวประชาสัมพันธ์
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {["ข่าวที่ 1", "ข่าวที่ 2", "ข่าวที่ 3"].map((item, i) => (
              <motion.div
                key={i}
                className="rounded-2xl bg-white p-5 shadow-md transition hover:shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <motion.img
                  src="/placeholder.png"
                  alt={item}
                  className="mb-4 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                />
                <h3 className="mb-2 font-bold">{item}</h3>
                <p className="text-gray-600">รายละเอียดเนื้อหาของข่าว...</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Calendar Section */}
        <motion.section
          initial={{ opacity: 0, rotateX: -30 }}
          whileInView={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex items-center justify-center bg-gray-50 py-20"
        >
          <motion.div
            whileHover={{ rotate: 3, scale: 1.02 }}
            className="rounded-2xl bg-white p-6 shadow-lg"
          >
            <h3 className="mb-3 text-center font-semibold">ปฏิทินกิจกรรม</h3>
            <div className="text-gray-600">🗓️ เดือนตุลาคม 2568</div>
          </motion.div>
        </motion.section>

        {/* Q&A Section */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <h2 className="mb-6 text-2xl font-semibold">Q & A</h2>
          <div className="space-y-4">
            {["ทดสอบระบบ Q&A", "การตอบกลับ"].map((text, i) => (
              <motion.div
                key={i}
                className="rounded-xl bg-white p-4 shadow"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <p className="font-semibold text-gray-800">{text}</p>
                <p className="mt-1 text-sm text-gray-600">
                  ตัวอย่างข้อความของความคิดเห็น...
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </>
  );
}
