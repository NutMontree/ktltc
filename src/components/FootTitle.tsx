import { LinkPreview } from "./ui/link-preview";

export function FootTitle() {
  return (
    <>
      <div className="text-xs">
        <h1 className="text-base">KTL-TC ONE TEAM </h1>
        <p className="text-sky-500 pb-[12px]">#เรียนดีมีความสุข #เทคนิคกันท์ </p>
        <p className="border-t pt-[12px] ">
          " วิสัยทัศน์ วิทยาลัยเทคนิคกันทรลักษ์ "
        </p>
        <p>
          ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
          เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
          มีความร่วมมือกับสถานประกอบการและชุมชน
        </p>
        <br />
        <p className="border-t pt-[12px]">
          " ค่านิยม วิทยาลัยเทคนิคกันทรลักษ์ "
        </p>
        <p className="">" ยิ้ม ไหว้ เเต่งกายดี รู้จักสวัสดี ขอบคุณ เเละขอโทษ "</p>
        <br />
        <p className="border-t pt-[12px]">👉 ช่องทางการติดต่อ</p>
        <LinkPreview className="hover:text-sky-600" url={'https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh'}><p>Facebook : งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์</p></LinkPreview>
        <LinkPreview className="hover:text-sky-600" url={'https://www.facebook.com/profile.php?id=100057326985699'}><p> เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์</p></LinkPreview>
        <LinkPreview className="hover:text-sky-600" url={'https://www.facebook.com/ktl.ac.th'}><p> เพจ Facebook : วิทยาลัยเทคนิคกันทรลักษ์ Today </p></LinkPreview>
        <LinkPreview className="hover:text-sky-600" url={'https://www.youtube.com/channel/UCHuaK-licd7-XrT4qQhHr3Q'}><p>Youtube : วิทยาลัยเทคนิคกันทรลักษ์ Today </p></LinkPreview>
        <LinkPreview className="hover:text-sky-600" url={'https://ktltc.vercel.app'}><p>Website : https://ktltc.vercel.app</p></LinkPreview>
        <LinkPreview className="hover:text-sky-600" url={'mailto:relationktl@gmail.com'}><p className="pb-[12px]">Gmail : relationktl@gmail.com</p></LinkPreview>
        <p className="border-t pt-[12px]">👉 สอบถามข้อมูลเพิ่มเติม</p>
        <p>โทร : 061 - 4122765 หรือ 045 - 811753</p>
      </div>
    </>
  );
}
