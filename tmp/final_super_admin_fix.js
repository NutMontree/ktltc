/**
 * final_super_admin_fix.js: สคริปต์เฉพาะกิจสำหรับแก้ไขรายการแผนกในหน้า Super Admin
 * 
 * หน้าที่: 
 * - ค้นหาบรรทัดที่ 542 ถึง 665 ในไฟล์ super-admin/page.tsx และแทนที่ด้วยรายการแผนกชุดใหม่
 * - ใช้แก้ไขปัญหาความไม่สอดคล้องของชื่อแผนกที่แสดงใน Dropdown
 * - สคริปต์นี้เป็นการแก้ไขแบบ "Hard-coded Replace" ตามเลขบรรทัด
 */

const fs = require('fs');
const path = 'd:/ktl/src/app/dashboard/super-admin/page.tsx';
let data = fs.readFileSync(path, 'utf8');
let lines = data.split(/\r?\n/);

const startLineIndex = 541; // Line 542 (0-indexed)
const endLineIndex = 664;   // Line 665 (0-indexed)

const newSelectBlock = [
    '                        <select',
    '                          value={user.department || "ไม่มีสังกัด"}',
    '                          onChange={(e) =>',
    '                            changeDepartment(',
    '                              user._id,',
    '                              e.target.value,',
    '                              user.name,',
    '                            )',
    '                          }',
    '                          className="text-xs font-bold border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-2.5 outline-none text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 focus:border-blue-500 transition-all cursor-pointer max-w-[180px]"',
    '                        >',
    '                          <option value="ไม่มีสังกัด">- ไม่ระบุสังกัด -</option>',
    '                          <option value="ผู้บริหารสถานศึกษา">ผู้บริหารสถานศึกษา</option>',
    '                          <optgroup label="๑. ฝ่ายบริหารทรัพยากร">',
    '                            <option value="งานบริหารงานทั่วไป">งานบริหารงานทั่วไป</option>',
    '                            <option value="งานบริหารและพัฒนาทรัพยากรบุคคล">งานบริหารและพัฒนาทรัพยากรบุคคล</option>',
    '                            <option value="งานการเงิน">งานการเงิน</option>',
    '                            <option value="งานการบัญชี">งานการบัญชี</option>',
    '                            <option value="งานพัสดุ">งานพัสดุ</option>',
    '                            <option value="งานอาคารสถานที่">งานอาคารสถานที่</option>',
    '                            <option value="งานทะเบียน">งานทะเบียน</option>',
    '                            <option value="งานแม่บ้าน/นักการ">งานแม่บ้าน/นักการ</option>',
    '                          </optgroup>',
    '                          <optgroup label="๒. ฝ่ายยุทธศาสตร์และแผนงาน">',
    '                            <option value="งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ">งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ</option>',
    '                            <option value="งานมาตรฐานและการประกันคุณภาพ">งานมาตรฐานและการประกันคุณภาพ</option>',
    '                            <option value="งานศูนย์ดิจิทัลและสื่อสารองค์กร">งานศูนย์ดิจิทัลและสื่อสารองค์กร</option>',
    '                            <option value="งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์">งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์</option>',
    '                            <option value="งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ">งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ</option>',
    '                            <option value="งานติดตามและประเมินผลการ">งานติดตามและประเมินผลการ</option>',
    '                          </optgroup>',
    '                          <optgroup label="๓. ฝ่ายพัฒนากิจการนักเรียน นักศึกษา">',
    '                            <option value="งานกิจกรรมนักเรียนนักศึกษา">งานกิจกรรมนักเรียนนักศึกษา</option>',
    '                            <option value="งานครูที่ปรึกษาและการแนะแนว">งานครูที่ปรึกษาและการแนะแนว</option>',
    '                            <option value="งานปกครองและความปลอดภัยนักเรียนนักศึกษา">งานปกครองและความปลอดภัยนักเรียนนักศึกษา</option>',
    '                            <option value="งานสวัสดิการนักเรียนนักศึกษา">งานสวัสดิการนักเรียนนักศึกษา</option>',
    '                            <option value="งานโครงการพิเศษและการบริการ">งานโครงการพิเศษและการบริการ</option>',
    '                          </optgroup>',
    '                          <optgroup label="๔. ฝ่ายวิชาการ (ปวช.)">',
    '                            <option value="ปวช. สาขาวิชาการบัญชี">สาขาวิชาการบัญชี (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาการตลาด">สาขาวิชาการตลาด (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาการโรงเเรม">สาขาวิชาการโรงเเรม (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาตัวถังเเละสีรถยนต์">สาขาวิชาตัวถังเเละสีรถยนต์ (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล">สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาช่างยนต์">สาขาวิชาช่างยนต์ (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาช่างกลโรงงาน">สาขาวิชาช่างกลโรงงาน (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาช่างเชื่อมโลหะ">สาขาวิชาช่างเชื่อมโลหะ (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาช่างไฟฟ้า">สาขาวิชาช่างไฟฟ้า (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาอิเล็กทรอนิกส์">สาขาวิชาอิเล็กทรอนิกส์ (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชายานยนต์ไฟฟ้า">สาขาวิชายานยนต์ไฟฟ้า (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาโยธา">สาขาวิชาโยธา (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาโลจิสติกส์">สาขาวิชาโลจิสติกส์ (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาการจัดการสำนักงานดิจิทัล">สาขาวิชาการจัดการสำนักงานดิจิทัล (ปวช.)</option>',
    '                            <option value="ปวช. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์">สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ (ปวช.)</option>',
    '                          </optgroup>',
    '                          <optgroup label="๔. ฝ่ายวิชาการ (ปวส.)">',
    '                            <option value="ปวส. สาขาวิชาเทคนิคเครื่องกล">สาขาวิชาเทคนิคเครื่องกล (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเทคนิคการผลิต">สาขาวิชาเทคนิคการผลิต (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเทคนิคโลหะ">สาขาวิชาเทคนิคโลหะ (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาไฟฟ้า">สาขาวิชาไฟฟ้า (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาโยธา">สาขาวิชาโยธา (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาการบัญชี">สาขาวิชาการบัญชี (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์">สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์ (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเทคนิคยานยนต์ไฟฟ้า">สาขาวิชาเทคนิคยานยนต์ไฟฟ้า (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล">สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาการตลาด">สาขาวิชาการตลาด (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาการโรงเเรม">สาขาวิชาการโรงเเรม (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์">สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถัง เเละสีรถยนต์">สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถัง เเละสีรถยนต์ (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาการจัดการโลจิสติกส์ เเละซัพพลายเชน">สาขาวิชาการจัดการโลจิสติกส์ เเละซัพพลายเชน (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาการจัดการสำนักงานดิจิทัล">สาขาวิชาการจัดการสำนักงานดิจิทัล (ปวส.)</option>',
    '                            <option value="ปวส. สาขาวิชาคอมพิวเตอร์เกมเเละแอนิเมชั่น">สาขาวิชาคอมพิวเตอร์เกมเเละแอนิเมชั่น (ปวส.)</option>',
    '                          </optgroup>'
];

// ยืนยันว่าบรรทัดที่เริ่มต้นคือ <select ตามที่คาดไว้หรือไม่
if (lines[startLineIndex].trim() === '<select') {
    lines.splice(startLineIndex, (endLineIndex - startLineIndex + 1), ...newSelectBlock);
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log("Successfully fixed the super-admin department list.");
} else {
    console.error("Mismatch at start line: Expected '<select>', found '" + lines[startLineIndex].trim() + "'");
    process.exit(1);
}

