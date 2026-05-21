"use client";

import { motion } from "framer-motion";
import { Card, CardBody, Button } from "@heroui/react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Youtube, 
  Clock, 
  Send,
  Navigation2
} from "lucide-react";
import { useState } from "react";

export default function AboutContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการติดต่อระบบ");
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      title: "ที่อยู่สถานศึกษา",
      value: "82 หมู่ 1 ถนนกันทรลักษ์-กันทรารมย์ ตำบลจานใหญ่ อำเภอกันทรลักษ์ จังหวัดศรีสะเกษ 33110",
      description: "ตั้งอยู่บนทางหลวงหมายเลข 2201 เดินทางสะดวก ปลอดภัย",
      icon: <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />,
      actionText: "นำทางด้วย Google Maps",
      actionUrl: "https://maps.google.com/?q=14.754043,104.658070",
      colorClass: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
    },
    {
      title: "เบอร์โทรศัพท์ติดต่อ",
      value: "045-811-053 (เบอร์หลัก/ประชาสัมพันธ์)",
      extraValues: [
        "045-826-447 (ฝ่ายบริหารทรัพยากร)"
      ],
      description: "เวลาทำการ: จันทร์ - ศุกร์ 08:30 น. - 16:30 น. (เว้นวันหยุดราชการ)",
      icon: <Phone className="w-6 h-6 text-blue-600 dark:text-blue-500" />,
      actionText: "โทรออกทันที",
      actionUrl: "tel:045811053",
      colorClass: "from-sky-500/10 to-blue-500/10 border-sky-500/20"
    },
    {
      title: "ช่องทางอีเมล",
      value: "ktltc@ktltc.ac.th (อีเมลหลักสถานศึกษา)",
      extraValues: [
        "ktlooobbobo@gmail.com (งานสารบรรณ)",
        "info@ktl.ac.th (ติดต่อสอบถามทั่วไป)"
      ],
      description: "สามารถส่งหนังสือราชการ ประสานงานการศึกษา หรือสอบถามข้อมูลเพิ่มเติมได้ตลอด 24 ชม.",
      icon: <Mail className="w-6 h-6 text-rose-600 dark:text-rose-500" />,
      actionText: "เขียนอีเมลถึงเรา",
      actionUrl: "mailto:ktltc@ktltc.ac.th",
      colorClass: "from-rose-500/10 to-orange-500/10 border-rose-500/20"
    }
  ];

  const socialLinks = [
    {
      name: "Facebook Page",
      label: "งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์",
      url: "https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh",
      icon: <Facebook className="w-5 h-5" />,
      bgClass: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    {
      name: "Official Website",
      label: "ktltc.ac.th",
      url: "https://ktltc.ac.th/",
      icon: <Globe className="w-5 h-5" />,
      bgClass: "bg-slate-700 hover:bg-slate-800 text-white"
    },
    {
      name: "YouTube Channel",
      label: "วิทยาลัยเทคนิคกันทรลักษ์ KTLTC",
      url: "https://www.youtube.com/@ktltc2566",
      icon: <Youtube className="w-5 h-5" />,
      bgClass: "bg-red-600 hover:bg-red-700 text-white"
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-blue-600/5 blur-[120px] dark:bg-blue-600/10" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[60vw] w-[60vw] rounded-full bg-amber-500/5 blur-[150px] dark:bg-amber-500/10" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 z-10">
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-500 text-xs font-bold mb-4 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> ติดต่อเรา / About US
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            ช่องทางการติดต่อสื่อสาร
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
            วิทยาลัยเทคนิคกันทรลักษ์ ยินดีให้บริการและต้อนรับทุกท่านด้วยความอบอุ่น 
            ท่านสามารถติดต่อสอบถามข้อมูลการเรียนการสอน รับสมัครนักเรียน หรือประสานงานราชการได้ตามช่องทางด้านล่างนี้
          </p>
        </motion.div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-md hover:shadow-lg overflow-hidden flex flex-col justify-between transition-all duration-300">
                <CardBody className="p-6 md:p-8 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{card.title}</h3>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 font-bold text-base leading-relaxed mb-4">
                      {card.value}
                    </p>

                    {card.extraValues && (
                      <div className="space-y-2 mb-4">
                        {card.extraValues.map((val, idx) => (
                          <p key={idx} className="text-slate-700 dark:text-slate-300 font-semibold text-sm border-l-2 border-slate-300 dark:border-slate-700 pl-3">
                            {val}
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  <a 
                    href={card.actionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full mt-auto"
                  >
                    <Button 
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 font-bold border border-slate-200/50 dark:border-slate-700/50 text-sm transition-colors duration-300"
                      endContent={<Navigation2 className="w-4 h-4 text-amber-500 rotate-45" />}
                    >
                      {card.actionText}
                    </Button>
                  </a>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Map & Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col h-full"
          >
            <Card className="h-full bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col shadow-md">
              <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" /> แผนที่ตั้งวิทยาลัย
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">พิกัดทางภูมิศาสตร์: 14.754043, 104.658070</p>
                </div>
                <a 
                  href="https://maps.google.com/?q=14.754043,104.658070" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 text-xs">
                    เปิดในแอปนำทาง
                  </Button>
                </a>
              </div>
              <div className="grow w-full min-h-[350px] lg:min-h-[450px] relative bg-slate-100 dark:bg-slate-950">
                <iframe 
                  src="https://maps.google.com/maps?q=14.754043,104.658070&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </Card>
          </motion.div>

          {/* Contact / Inquiry Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <Card className="h-full bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 shadow-md">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-500" /> ฝากคำถามหรือข้อความติดต่อ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                กรอกข้อมูลด้านล่าง เจ้าหน้าที่งานสารบรรณจะติดต่อกลับท่านโดยเร็วที่สุด
              </p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-4 animate-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ส่งข้อความสำเร็จ!</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">ขอขอบพระคุณสำหรับข้อมูลของท่าน ระบบกำลังบันทึกส่งเรื่อง...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="กรอกชื่อ-นามสกุลของท่าน"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      อีเมลติดต่อกลับ <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      placeholder="เช่น email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      เรื่องที่ต้องการติดต่อ <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="เช่น สอบถามเรื่องรับสมัครนักเรียนใหม่, ขอผลการเรียน"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      รายละเอียดข้อความ <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      placeholder="กรอกข้อมูลที่ท่านต้องการสอบถามหรือติดต่อสื่อสารเพิ่มเติม..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    isLoading={loading}
                    className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-extrabold text-slate-950 mt-8 shadow-lg shadow-amber-500/20 py-6 text-base rounded-xl"
                    endContent={<Send className="w-5 h-5 text-slate-950" />}
                  >
                    {loading ? "กำลังส่งข้อมูล..." : "ส่งข้อความติดต่อ"}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Video Introduction Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 shadow-md">
            
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-lg border border-slate-200/60 dark:border-slate-800 max-w-4xl mx-auto">
              <iframe
                src="https://www.youtube.com/embed/tEqHeRdAiD0"
                title="วีดิทัศน์แนะนำวิทยาลัยเทคนิคกันทรลักษ์"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </Card>
        </motion.div>

        {/* Facebook Page Plugin Grid Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 shadow-md">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-black tracking-wider uppercase mb-3 inline-block">
                Facebook Department Network
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">เพจเครือข่ายสาขาวิชาและชมรมกิจกรรม</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                ติดตามข่าวสารอัปเดตอย่างใกล้ชิดจากเพจ Facebook ประจำแผนกวิชาเรียนและกลุ่มกิจกรรมภายในวิทยาลัยเทคนิคกันทรลักษ์
              </p>
            </div>

            {/* 1. Compact Row - แผนกวิชาต่างๆ */}
            <div className="mb-12">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 border-l-4 border-blue-600 pl-3">
                แผนกวิชา / สาขาการเรียนการสอน
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { title: "แผนกวิชาช่างอิเล็กทรอนิกส์", url: "https://www.facebook.com/profile.php?id=100063483313526" },
                  { title: "แผนกช่างไฟฟ้ากำลัง", url: "https://www.facebook.com/ktltc.ac.th.en" },
                  { title: "แผนกวิชาช่างเชื่อมโลหะ", url: "https://www.facebook.com/profile.php?id=100068997166818" },
                  { title: "แผนกวิชาช่างกลโรงงาน", url: "https://www.facebook.com/profile.php?id=100057195379923" },
                  { title: "แผนกวิชาสามัญสัมพันธ์ (วิทยาศาสตร์)", url: "https://www.facebook.com/ScienceKTL" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-xs flex flex-col items-center">
                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 mb-3 truncate w-full text-center">{item.title}</p>
                    <div className="w-full h-[130px] rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                      <iframe 
                        src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(item.url)}&tabs=&width=340&height=130&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                        width="100%" 
                        height="130" 
                        style={{ border: "none", overflow: "hidden" }} 
                        scrolling="no" 
                        frameBorder="0" 
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Timeline Row - ชมรมและหน่วยงานกิจกรรม */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 border-l-4 border-emerald-600 pl-3">
                ชมรมกิจกรรม / องค์การนักวิชาชีพ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "องค์การวิชาชีพในอนาคตแห่งประเทศไทย (อวท.)", url: "https://www.facebook.com/profile.php?id=100065239134417" },
                  { title: "ชมรม TO BE NUMBER ONE", url: "https://www.facebook.com/profile.php?id=61567041267941" },
                  { title: "แผนกวิชาการโรงแรม", url: "https://www.facebook.com/profile.php?id=100088379594921" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-xs flex flex-col">
                    <p className="text-sm font-black text-slate-600 dark:text-slate-300 mb-4 text-center truncate">{item.title}</p>
                    <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 shadow-inner">
                      <iframe 
                        src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(item.url)}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                        width="100%" 
                        height="500" 
                        style={{ border: "none", overflow: "hidden" }} 
                        scrolling="no" 
                        frameBorder="0" 
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-8 text-center shadow-md">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">เครือข่ายสังคมออนไลน์</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 max-w-2xl mx-auto">
              ท่านสามารถรับชมข่าวสาร กิจกรรม และอัปเดตต่างๆ ของวิทยาลัยเทคนิคกันทรลักษ์ ผ่านแพลตฟอร์มโซเชียลมีเดียที่เป็นทางการของเราได้ทุกวัน
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-850/80 group-hover:border-slate-300 dark:group-hover:border-slate-700/80 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50 transition-all duration-300 shadow-xs">
                    <div className={`p-3 rounded-xl flex items-center justify-center ${social.bgClass}`}>
                      {social.icon}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{social.name}</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                        {social.label}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
