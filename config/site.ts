

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "วิทยาลัยเทคนิคกันทรลักษ์",
  description: "คลังเก็บข้อมูลวิทยาลัยเทคนิคกันทรลักษ์",
  navItems: [
    {
      label: "หน้าหลัก",
      href: "/",
    },
    {
      label: "เกี่ยวกับสถานศึกษา",
      href: "/pressrelease",
    },
    {
      label: "หน่วยงานภายใน",
      href: "/newsletter",
    },
    {
      label: "ข้อมูลบุคลากร",
      href: "/announcement",
    },
    {
      label: "เมนูลัด",
      href: "/bidding",
    },
    {
      label: "ดาวโหลด",
      href: "/technicalcollegeorders",
    },
  ],

  navMenuItems: [
    {
      label: "KTLTC",
      href: "/",
    },
    {
      label: "ข่าวประชาสัมพันธ์",
      href: "/pressrelease",
    },
    {
      label: "จดหมายข่าว",
      href: "/newsletter",
    },
    {
      label: "ข่าวประกาศ",
      href: "/announcement",
    },
    {
      label: "ข่าวประกวดราคา",
      href: "/bidding",
    },
    {
      label: "คำสั่งวิทยาลัย",
      href: "/technicalcollegeorders",
    },
  ],

  links: {
    sponsor: "https://www.facebook.com/profile.php?id=61553558543619",
  },
};
