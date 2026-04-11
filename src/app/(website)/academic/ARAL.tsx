import React from "react";

export default function ARAL() {
  const responsibilities = [
    "วางแผนพัฒนาบริการห้องสมุดและศูนย์การเรียนรู้ด้วยตนเองให้เป็นแหล่งเรียนรู้ด้วยระบบเทคโนโลยีสารสนเทศที่ทันสมัย",
    "จัดระบบบริการให้ได้มาตรฐาน",
    "ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา",
    "จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
  ];

  return (
    <div className="py-6 text-base sm:text-lg">
      <p className="text-xl font-bold mb-4">มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
      <div className="space-y-2">
        {responsibilities.map((text, index) => (
          <p key={index}>{index + 1}. {text}</p>
        ))}
      </div>
    </div>
  );
}
