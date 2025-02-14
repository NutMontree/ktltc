//
"use client"; // top to the file
import { FlipWords } from "@/components/ui/flip-words";
export default function philosophy() {
  const words = [
    "ปรัชญา วิสัยทัศน์",
    "พันธกิจ เป้าประสงค์",
    "เอกลักษณ์ อัตลักษณ์",
    "ค่านิยม คำขวัญ",
    "",
  ];
  return (
    <>
      <div
        className="pb-8 flex justify-center items-center
       "
      >
        <div className="text-xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
          ข้อมูลพื้นฐานของสถานศึกษา
          <br />
          <FlipWords
            words={words}
            className=" text-sky-700                   
                        dark:text-sky-700 
                        hover:text-sky-600 "
          />
          <br />
          วิทยาลัยเทคนิคกันทรลักษ์
        </div>
      </div>
      <div className="">
        <div className="font-semibold ">ปรัชญา ( philosophy)</div>
        <div className="pl-6 pb-4">ฝีมือดี มีวินัย ใฝ่คุณธรรม นำสังคม</div>
        <div className="font-semibold ">วิสัยทัศน์ (vision)</div>
        <div className="pl-6 pb-4">
          <p>
            ผลิตและพัฒนาก าลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
            เป็นประชาคม แห่งการเรียนรู้ เน้นการท างานเป็นทีม
            มีความร่วมมือกับสถานประกอบการและชุมชน
          </p>
          <p>
            Kantharalak Technical College (KTL-TC) Committed to keep moving for
            work to knowledge management by Technology & Teamwork, Collaboration
            & Community as Learning Society
          </p>
        </div>
        <div className="font-semibold ">พันธกิจ (Mission)</div>
        <div className="pl-6 pb-4">
          <p>1. การจัดการความรู้แก่ผู้เรียน</p>
          <p>2. พัฒนาความรู้ ทักษะ และการประยุกต์ใช้</p>
          <p>3. ส่งเสริมคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์</p>
          <p>4. พัฒนาหลักสูตร อาชีวศึกษา</p>
          <p>5. จัดการเรียนการสอนอาชีวศึกษา</p>
          <p>6. บริหารจัดการตามหลักธรรมาภิบาล</p>
          <p>7. การนำนโยบายสู่การปฏิบัติ</p>
          <p>8. สร้างความร่วมมือในการสร้างสังคมแห่งการเรียนรู้</p>
          <p>9. พัฒนานวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ และงานวิจัย</p>
        </div>

        <div className="font-semibold ">เป้าประสงค์ (Goal)</div>
        <div className="pl-6 pb-4">
          <p>1. ผู้เรียนมีคุณภาพและได้มาตรฐานอาชีวศึกษา</p>
          <p>
            2. ผู้เรียนมีความรู้ ทักษะ และเจตคติตรงตามความต้องการของตลาดแรงงาน
          </p>
          <p>
            3. บุคลากร นักเรียน นักศึกษา
            มีความรู้ความสามารถในการใช้นวัตกรรมและเทคโนโลยี
          </p>
          <p>
            4. นักเรียน นักศึกษา
            มีการแลกเปลี่ยนเรียนรู้กับสถาบันและองค์กรระหว่างประเทศ
          </p>
        </div>

        <div className="font-semibold ">เอกลักษณ์ (Unity)</div>
        <div className="pl-6 pb-4">
          <p>1.ผู้นำบริการวิชาชีพสู่ชุมชน</p>
        </div>
        <div className="font-semibold ">อัตลักษณ์ (Identity)</div>
        <div className="pl-6 pb-4">
          <p>ฝีมือดี มีคุณธรรม</p>
        </div>
        <div className="font-semibold ">ค่านิยม (Values)</div>
        <div className="pl-6 pb-4">
          <p>ยิ้ม ไหว้ แต่งกายดี รู้จักสวัสดี ขอบคุณ และขอโทษ</p>
        </div>
        <div className="font-semibold ">คำขวัญ (Motto)</div>
        <div className="pl-6 pb-4">
          <p>
            เรียนรู้ปฏิบัติสู่นวัตกรรม ผู้นำด้านเทคโนโลยี
            สู่วิถีเศรษฐกิจสร้างสรรค์ มุ่งมั่นพัฒนากำลังคนด้านวิชาชีพ
          </p>
        </div>
      </div>
    </>
  );
}
