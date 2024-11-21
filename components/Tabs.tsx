import React from "react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";

export default function TabsPage() {
  return (
    <div className="flex w-full flex-col px-4 py-4">
      <Tabs aria-label="Options">
        <Tab key="วิสัยทัศน์ " title="วิสัยทัศน์ ">
          <Card>
            <CardBody>
              ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
              เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
              มีความร่วมมือกับสถานประกอบการและชุมชน
            </CardBody>
          </Card>
        </Tab>
        <Tab key="เอกลักษ์" title="เอกลักษ์">
          <Card>
            <CardBody>ผู้นำบริการสู่ชุมชน</CardBody>
          </Card>
        </Tab>
        <Tab key="อัตลักษณ์" title="อัตลักษณ์">
          <Card>
            <CardBody>ฝีมือดี มีคุณธรรม</CardBody>
          </Card>
        </Tab>
        <Tab key="ปรัชญา" title="ปรัชญา">
          <Card>
            <CardBody>ฝีมือดี มีวินัย ใฝ่คุณธรรม นำสังคม</CardBody>
          </Card>
        </Tab>
        <Tab key="ค่านิยม" title="ค่านิยม">
          <Card>
            <CardBody>ยิ้มไหว้ แต่งกายดี รู้จักสวัสดี ขอบคุณ และขอโทษ</CardBody>
          </Card>
        </Tab>
        <Tab key="คำขวัญ" title="คำขวัญ">
          <Card>
            <CardBody>เรียนรู้ปฏิบัติสู่นวัตกรรม ผู้นำด้านเทคโนโลยี่ </CardBody>
            <CardBody>
              สู่วิถีเศรฐกิจสร้างสรรค์ มุ่นมั่นพัฒนากำลังคนด้านวิชาชีพ
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
