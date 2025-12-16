"use client";

import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import { Image } from "@heroui/image";
import { Card, Tabs, Tab } from "@heroui/react";
import { motion } from "framer-motion";
import {
  FileTextOutlined,
  PhoneOutlined,
  FormOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FacebookFilled,
} from "@ant-design/icons"; // แนะนำให้ใช้ Icon Vector เพื่อความคมชัด

const Features = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl py-16 font-sans">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/10" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-900/10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 container mx-auto px-4"
      >
        {/* --- Header --- */}
        <div className="mb-12 text-center">
          <Link href="/GECC" className="group inline-block">
            <span className="mb-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-transform group-hover:scale-105">
              GECC Center
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-800 transition-colors group-hover:text-blue-600 md:text-4xl dark:text-slate-100">
              ศูนย์ราชการสะดวก
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
              ศูนย์กลางการให้บริการข้อมูลและอำนวยความสะดวกแบบครบวงจร
              เพื่อประชาชนและผู้รับบริการ
            </p>
          </Link>
        </div>

        {/* --- Facebook Page Plugin (Optional Placement) --- */}
        {/* <div className="mb-10 flex justify-center">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fngan.prachasamphanth.withyalay.thekhnikh&tabs=timeline&width=340&height=130&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
              width="340"
              height="130"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            ></iframe>
          </div>
        </div> */}
        {/* --- Tabs Section --- */}
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-3xl border border-slate-100 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <Tabs
              aria-label="GECC Services"
              color="primary"
              variant="solid" // ใช้แบบ Solid (Pills) เพื่อความทันสมัย
              classNames={{
                tabList:
                  "gap-2 w-full relative rounded-2xl bg-slate-100 p-2 dark:bg-neutral-800",
                cursor:
                  "w-full bg-white dark:bg-neutral-700 shadow-sm rounded-xl",
                tab: "max-w-full h-12 text-slate-500 dark:text-slate-400 font-medium",
                tabContent:
                  "group-data-[selected=true]:text-blue-600 dark:group-data-[selected=true]:text-white font-bold text-base",
              }}
            >
              {/* Tab 1: บริการ */}
              <Tab
                key="services"
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-lg" />
                    <span>บริการออนไลน์</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <ServiceCard
                    href="https://admission.vec.go.th/web/Login.htm?mode=index"
                    icon={
                      <GlobalOutlined
                        style={{ fontSize: "32px", color: "#2563EB" }}
                      />
                    }
                    title="สมัครเรียนออนไลน์"
                    desc="ระบบรับสมัครนักศึกษาใหม่"
                  />
                  <ServiceCard
                    href="/GECC"
                    icon={
                      <FileTextOutlined
                        style={{ fontSize: "32px", color: "#2563EB" }}
                      />
                    }
                    title="เอกสารทะเบียน"
                    desc="ดาวน์โหลดแบบฟอร์มต่างๆ"
                  />
                </div>
              </Tab>

              {/* Tab 2: ติดต่อ */}
              <Tab
                key="contact"
                title={
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-lg" />
                    <span>ช่องทางติดต่อ</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                  <ServiceCard
                    href="tel:0614122765"
                    icon={
                      <PhoneOutlined
                        style={{ fontSize: "32px", color: "#10B981" }}
                      />
                    } // Green for phone
                    title="โทรศัพท์"
                    desc="061-412-2765"
                  />
                  <ServiceCard
                    href="https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw"
                    icon={
                      // LINE Icon SVG (Custom)
                      <svg
                        viewBox="0 0 24 24"
                        width="32"
                        height="32"
                        fill="#06C755"
                      >
                        <path d="M12 2C6.48 2 2 5.58 2 10c0 2.42 1.35 4.6 3.52 6.02L4.5 20.5l4.85-2.65c.85.24 1.76.37 2.65.37 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                      </svg>
                    }
                    title="ศูนย์ร้องทุกข์"
                    desc="ผ่านช่องทาง LINE OpenChat"
                  />
                  <ServiceCard
                    href="https://maps.google.com/?q=วิทยาลัยเทคนิคกันทรลักษ์"
                    icon={
                      <EnvironmentOutlined
                        style={{ fontSize: "32px", color: "#EF4444" }}
                      />
                    } // Red for map
                    title="แผนที่นำทาง"
                    desc="Google Maps Location"
                  />
                </div>
              </Tab>

              {/* Tab 3: แบบสำรวจ */}
              <Tab
                key="survey"
                title={
                  <div className="flex items-center gap-2">
                    <FormOutlined className="text-lg" />
                    <span>แบบสำรวจ</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  <ServiceCard
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdEf2XmgVMrNhz7Fl6O_8e_4yp5SjWyGxhC-pM64vIMPfBw3w/viewform"
                    icon={
                      <FormOutlined
                        style={{ fontSize: "32px", color: "#F59E0B" }}
                      />
                    }
                    title="ความต้องการผู้รับบริการ"
                    desc="แบบสำรวจความต้องการ GECC"
                  />
                  <ServiceCard
                    href="https://docs.google.com/forms/d/e/1FAIpQLSca9AXgqHmgVFMu9uHw16JyizUeFZ3JSVlPCB5fWpYScYwRww/viewform"
                    icon={
                      <FormOutlined
                        style={{ fontSize: "32px", color: "#F59E0B" }}
                      />
                    }
                    title="ความพึงพอใจ"
                    desc="ประเมินความพึงพอใจการให้บริการ"
                  />
                </div>
              </Tab>
            </Tabs>
          </Card>
        </div>
      </motion.div>
    </section>
  );
};

// --- Reusable Component: Service Card ---
// แยก Component ออกมาเพื่อให้ Code อ่านง่ายและแก้ที่เดียวจบ
const ServiceCard = ({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <Link
    href={href}
    target={href.startsWith("http") ? "_blank" : "_self"}
    className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700"
  >
    <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 dark:bg-neutral-900 dark:ring-neutral-700">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-700 group-hover:text-blue-600 dark:text-slate-200">
      {title}
    </h3>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
  </Link>
);

export default Features;
