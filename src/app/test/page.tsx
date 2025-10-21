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
          className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-blue-50 to-white"
        >
          <motion.h1
            className="text-4xl font-bold text-gray-800"
            whileHover={{ scale: 1.05 }}
          >
            ยินดีต้อนรับสู่ KTLTC
          </motion.h1>
          <motion.p
            className="text-gray-600 mt-4 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            วิทยาลัยเทคนิคกันทรลักษ์
          </motion.p>
        </motion.section>

        {/* Press Release Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-2xl font-semibold text-center mb-10">
            ข่าวประชาสัมพันธ์
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {["ข่าวที่ 1", "ข่าวที่ 2", "ข่าวที่ 3"].map((item, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-2xl bg-white shadow-md hover:shadow-xl transition"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <motion.img
                  src="/placeholder.png"
                  alt={item}
                  className="rounded-lg mb-4"
                  whileHover={{ scale: 1.05 }}
                />
                <h3 className="font-bold mb-2">{item}</h3>
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
          className="flex justify-center items-center py-20 bg-gray-50"
        >
          <motion.div
            whileHover={{ rotate: 3, scale: 1.02 }}
            className="bg-white shadow-lg p-6 rounded-2xl"
          >
            <h3 className="font-semibold mb-3 text-center">ปฏิทินกิจกรรม</h3>
            <div className="text-gray-600">🗓️ เดือนตุลาคม 2568</div>
          </motion.div>
        </motion.section>

        {/* Q&A Section */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-6">Q & A</h2>
          <div className="space-y-4">
            {["ทดสอบระบบ Q&A", "การตอบกลับ"].map((text, i) => (
              <motion.div
                key={i}
                className="p-4 bg-white rounded-xl shadow"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <p className="font-semibold text-gray-800">{text}</p>
                <p className="text-gray-600 text-sm mt-1">
                  ตัวอย่างข้อความของความคิดเห็น...
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </>
  )
}
