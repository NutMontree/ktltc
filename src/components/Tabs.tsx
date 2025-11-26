import { Tabs, Tab, Card, CardBody } from "@heroui/react";

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

// // import { Tabs, Tab, Card, CardBody } from "@heroui/react";
// import { Tabs } from "@/components/ui/tabs";

// // export default function TabsPage() {
// //   return (
// //     <div className="flex w-full flex-col px-4 py-4">
// //       <Tabs aria-label="Options">
// //         <Tab key="วิสัยทัศน์ " title="วิสัยทัศน์ ">
// //           <Card>
// //             <CardBody>
// //               ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
// //               เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นที24               มีความร่วมมือกับสถานประกอบการและชุมชน
// //             </CardBody>
// //           </Card>
// //         </Tab>
// //         <Tab key="เอกลักษ์" title="เอกลักษ์">
// //           <Card>
// //             <CardBody>ผู้นำบริการสู่ชุมชน</CardBody>
// //           </Card>
// //         </Tab>
// //         <Tab key="อัตลักษณ์" title="อัตลักษณ์">
// //           <Card>
// //             <CardBody>ฝีมือดี มีคุณธรรม</CardBody>
// //           </Card>
// //         </Tab>
// //         <Tab key="ปรัชญา" title="ปรัชญา">
// //           <Card>
// //             <CardBody>ฝีมือดี มีวินัย ใฝ่คุณธรรม นำสังคม</CardBody>
// //           </Card>
// //         </Tab>
// //         <Tab key="ค่านิยม" title="ค่านิยม">
// //           <Card>
// //             <CardBody>ยิ้มไหว้ แต่งกายดี รู้จักสวัสดี ขอบคุณ และขอโทษ</CardBody>
// //           </Card>
// //         </Tab>
// //         <Tab key="คำขวัญ" title="คำขวัญ">
// //           <Card>
// //             <CardBody>เรียนรู้ปฏิบัติสู่นวัตกรรม ผู้นำด้านเทคโนโลยี่ </CardBody>
// //             <CardBody>
// //               สู่วิถีเศรฐกิจสร้างสรรค์ มุ่นมั่นพัฒนากำลังคนด้านวิชาชีพ
// //             </CardBody>
// //           </Card>
// //         </Tab>
// //       </Tabs>
// //     </div>
// //   );
// // }

// export default function TabsPage() {
//   const tabs = [
//     {
//       title: "วิสัยทัศน์",
//       value: "วิสัยทัศน์",
//       content: (
//         <div className="md:text relative max-h-48 w-full overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-cyan-50 p-10 text-xl font-bold text-black">
//           <p>
//             ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี //
//             เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม //
//             มีความร่วมมือกับสถานประกอบการและชุมชน
//           </p>
//         </div>
//       ),
//     },
//     {
//       title: "เอกลักษ์",
//       value: "เอกลักษ์",
//       content: (
//         <div className="md:text relative max-h-48 w-full overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-cyan-50 p-10 text-xl font-bold text-black">
//           <p>ผู้นำบริการสู่ชุมชน</p>
//         </div>
//       ),
//     },
//     {
//       title: "อัตลักษณ์",
//       value: "อัตลักษณ์",
//       content: (
//         <div className="md:text relative max-h-48 w-full overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-cyan-50 p-10 text-xl font-bold text-black">
//           <p>ฝีมือดี มีคุณธรรม</p>
//         </div>
//       ),
//     },
//     {
//       title: "ปรัชญา",
//       value: "ปรัชญา",
//       content: (
//         <div className="md:text relative max-h-48 w-full overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-cyan-50 p-10 text-xl font-bold text-black">
//           <p>ฝีมือดี มีวินัย ใฝ่คุณธรรม นำสังคม</p>
//         </div>
//       ),
//     },
//     {
//       title: "ค่านิยม",
//       value: "ค่านิยม",
//       content: (
//         <div className="md:text relative max-h-48 w-full overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-cyan-50 p-10 text-xl font-bold text-black">
//           <p>ยิ้มไหว้ แต่งกายดี รู้จักสวัสดี ขอบคุณ และขอโทษ</p>
//         </div>
//       ),
//     },
//     {
//       title: "คำขวัญ",
//       value: "คำขวัญ",
//       content: (
//         <div className="md:text relative max-h-48 w-full overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-cyan-50 p-10 text-xl font-bold text-black">
//           <p>เรียนรู้ปฏิบัติสู่นวัตกรรม ผู้นำด้านเทคโนโลยี่</p>
//           <p>สู่วิถีเศรฐกิจสร้างสรรค์ มุ่นมั่นพัฒนากำลังคนด้านวิชาชีพ</p>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       <div>
//         <div className="b relative mx-auto my-40 flex h-80 w-full max-w-5xl flex-col items-start justify-start perspective-[1000px] md:h-160">
//           <Tabs tabs={tabs} />
//         </div>
//       </div>
//     </>
//   );
// }
