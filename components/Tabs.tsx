import React from "react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";

export default function TabsPage() {
  return (
    <div className="flex w-full flex-col px-6 py-6">
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
        <Tab key="music" title="Music">
          <Card>
            <CardBody>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </CardBody>
          </Card>
        </Tab>
        <Tab key="videos" title="Videos">
          <Card>
            <CardBody>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
