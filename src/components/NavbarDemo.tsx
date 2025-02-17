import { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn(" ", className)}>
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="ประวัติสถานศึกษา">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink
              className="hover:tyext-sky-500"
              href="/historyeducational"
            >
              ประวัติสถานศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/philosophy">
              ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/eduadmin">
              ทำเนียบผู้บริหาร
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/">
              โครงสร้างการบริหารงานสถานศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/">
              คณะกรรมการบริหารสถานศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/">
              คณะกรรมการสถานศึกษา
            </HoveredLink>
          </div>
        </MenuItem>

        <MenuItem
          setActive={setActive}
          active={active}
          item="ข้อมูลพื้นฐาน 9 ประการ"
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink
              className="hover:tyext-sky-500"
              href="/historyeducational"
            >
              ข้อมูลสถานศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/personnel">
              ข้อมูลบุคลากร
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/sid ">
              ข้อมูลนักเรียน นักศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ข้อมูลหลักสูตร
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ข้อมูลครุภัณฑ์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ข้อมูลงบประมาณ
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/buildings ">
              ข้อมูลอาคารสถานที่
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ข้อมูลตลาดแรงงาน
            </HoveredLink>
            <HoveredLink
              className="hover:text-sky-500"
              href="https://www.sisaket.go.th/"
              target="_blank"
            >
              ข้อมูลของจังหวัด
            </HoveredLink>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="หน่วยงานภายใน">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ฝ่ายบริหารทรัพยากร
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ฝ่ายแผนงานและความร่วมมือ
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ฝ่ายวิชาการ
            </HoveredLink>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="ข้อมูลบุคลากร">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink className="hover:text-sky-500" href="/executive ">
              ผู้บริหารสถานศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/mechanic ">
              แผนกวิชาช่างยนต์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/machine ">
              แผนกวิชาช่างกลโรงงาน
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/welder ">
              แผนกวิชาช่างเชื่อมโลหะ
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/electricity ">
              แผนกวิชาช่างไฟฟ้ากำลัง
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/electronics ">
              แผนกวิชาช่างอิเล็กทรอนิกส์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/technique ">
              แผนกวิชาเทคนิคพื้นฐาน
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/construct ">
              แผนกวิชาช่างก่อสร้าง
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/accounting ">
              แผนกวิชาบัญชี
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/marketing ">
              แผนกวิชาการตลาด
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/technology ">
              แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/hotel ">
              แผนกวิชาการโรงแรม
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ordinary ">
              แผนกวิชาสามัญสัมพันธ์
            </HoveredLink>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="เมนูลัด">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/GECC" className="hover:underline ">
              ศูนย์ราชการสะดวก
            </HoveredLink>
            <HoveredLink
              className="hover:text-sky-500"
              href="/https://std2018.vec.go.th/web/"
              target="_blank"
            >
              ระบบ ศธ. ออนไลน์
            </HoveredLink>
            <HoveredLink
              className="hover:text-sky-500"
              href="https://std2018.vec.go.th/web/ "
              target="_blank"
            >
              ตรวจสอบผลการเรียน
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              รับงานอิเล็กทรอนิกส์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              สมัครเรียนออนไลน์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              บทเรียนออนไลน์
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/pressrelease ">
              ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ
            </HoveredLink>
            <HoveredLink
              className="hover:tyext-sky-500"
              href="/https://v-cop.go.th/"
              target="_blank"
            >
              ศูนย์กำลังคนอาชีวศึกษา (V-COP)
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              รายงานประจำของสถานศึกษา (SAR)
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ID Plan
            </HoveredLink>
            <HoveredLink
              className="hover:text-sky-500"
              href="https://forms.gle/Hcwfjvd7S8zTbA3C8"
              target="_blank"
            >
              แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ ">
              ภาพรวมกิจกรรมในสถานศึกษา
            </HoveredLink>
            <HoveredLink className="hover:text-sky-500" href="/ "></HoveredLink>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="หน่วยงานภายใน">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink className="hover:text-sky-500" href="/ ">
              <MenuItem
                setActive={setActive}
                active={active}
                item="หน่วยงานภายใน"
              >
                <div className="flex flex-col space-y-4 text-sm py-2">
                  <HoveredLink className="hover:text-sky-500" href="/ ">
                    ฝ่ายบริหารทรัพยากร
                  </HoveredLink>
                  <HoveredLink className="hover:text-sky-500" href="/ ">
                    ฝ่ายแผนงานและความร่วมมือ
                  </HoveredLink>
                  <HoveredLink className="hover:text-sky-500" href="/ ">
                    ฝ่ายพัฒนากิจการนักเรียน นักศึกษา
                  </HoveredLink>
                  <HoveredLink className="hover:text-sky-500" href="/ ">
                    ฝ่ายวิชาการ
                  </HoveredLink>
                </div>
              </MenuItem>
            </HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
