import Link from "next/link";

/* eslint-disable react/no-unescaped-entities */
export function FootTitle() {
  return (
    <>
      <div className="text-xs">
        <h1 className="text-base">KTL-TC ONE TEAM </h1>
        <p className="text-sky-500 pb-3">#เรียนดีมีความสุข #เทคนิคกันท์ </p>
        <p className="border-t pt-3 ">
          " วิสัยทัศน์ วิทยาลัยเทคนิคกันทรลักษ์ "
        </p>
        <p>
          ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
          เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
          มีความร่วมมือกับสถานประกอบการและชุมชน
        </p>
        <br />
        <p className="border-t pt-3">" ค่านิยม วิทยาลัยเทคนิคกันทรลักษ์ "</p>
        <p className="">
          " ยิ้ม ไหว้ เเต่งกายดี รู้จักสวัสดี ขอบคุณ เเละขอโทษ "
        </p>
        <br />
        <p className="border-t pt-3">👉 ช่องทางการติดต่อ</p>
        <Link
          className="hover:text-sky-600"
          href={
            "https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh"
          }
        >
          <p>Facebook : งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์</p>
        </Link>
        <Link
          className="hover:text-sky-600"
          href={"https://www.facebook.com/profile.php?id=100057326985699"}
        >
          <p> เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์</p>
        </Link>
        <Link
          className="hover:text-sky-600"
          href={"https://www.facebook.com/ktl.ac.th"}
        >
          <p> เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์ Today </p>
        </Link>
        <Link
          className="hover:text-sky-600"
          href={"https://www.youtube.com/channel/UCHuaK-licd7-XrT4qQhHr3Q"}
        >
          <p>Youtube : วิทยาลัยเทคนิคกันทรลักษ์ Today </p>
        </Link>
        <Link className="hover:text-sky-600" href={"https://ktltc.site"}>
          <p>Website : https://ktltc.site</p>
        </Link>
        <Link
          className="hover:text-sky-600"
          href={"mailto:relationktl@gmail.com"}
        >
          <p className="pb-3">Gmail : relationktl@gmail.com</p>
        </Link>
        <p className="border-t pt-3">👉 สอบถามข้อมูลเพิ่มเติม</p>
        <p>โทร : 061 - 4122765 หรือ 045 - 811753</p>
      </div>
    </>
  );
}
