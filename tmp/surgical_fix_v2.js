/**
 * surgical_fix_v2.js: สคริปต์สำหรับแก้ไขเฉพาะจุด (Surgical Fix) ในหน้า Super Admin
 * 
 * หน้าที่: 
 * - เน้นไปที่การแก้ไขกลุ่ม <optgroup> ของ "ฝ่ายวิชาการ" ทั้งระดับ ปวช. และ ปวส.
 * - ค้นหาตำแหน่งของหัวข้อ "ฝ่ายวิชาการ" และแทนที่ข้อมูลภายในกลุ่มนั้นด้วยรายการที่ถูกต้อง
 * - ปลอดภัยกว่าการแทนที่ทั้งไฟล์ เพราะจะกระทบเฉพาะส่วนที่ระบุเท่านั้น
 */

const fs = require('fs');
const path = 'd:/ktl/src/app/dashboard/super-admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const searchLabel = 'label="๔. ฝ่ายวิชาการ (ปวช.)"';
const startIndex = content.indexOf(searchLabel);

if (startIndex === -1) {
    console.error("Marker not found: " + searchLabel);
    process.exit(1);
}

// Find the start of the tag containing this label
const tagStart = content.lastIndexOf('<optgroup', startIndex);
if (tagStart === -1) {
    console.error("Could not find start of optgroup tag");
    process.exit(1);
}

// Find the matching closing tag
const tagEnd = content.indexOf('</optgroup>', startIndex);
if (tagEnd === -1) {
    console.error("Could not find closing optgroup tag");
    process.exit(1);
}
const fullEndIndex = tagEnd + '</optgroup>'.length;

const newBlock = `<optgroup label="๔. ฝ่ายวิชาการ (ปวช.)">
                            <option value="ปวช. สาขาวิชาการบัญชี">สาขาวิชาการบัญชี (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาการตลาด">สาขาวิชาการตลาด (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาการโรงเเรม">สาขาวิชาการโรงเเรม (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาตัวถังเเละสีรถยนต์">สาขาวิชาตัวถังเเละสีรถยนต์ (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล">สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาช่างยนต์">สาขาวิชาช่างยนต์ (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาช่างกลโรงงาน">สาขาวิชาช่างกลโรงงาน (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาช่างเชื่อมโลหะ">สาขาวิชาช่างเชื่อมโลหะ (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาช่างไฟฟ้า">สาขาวิชาช่างไฟฟ้า (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาอิเล็กทรอนิกส์">สาขาวิชาอิเล็กทรอนิกส์ (ปวช.)</option>
                            <option value="ปวช. สาขาวิชายานยนต์ไฟฟ้า">สาขาวิชายานยนต์ไฟฟ้า (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาโยธา">สาขาวิชาโยธา (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาโลจิสติกส์">สาขาวิชาโลจิสติกส์ (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาการจัดการสำนักงานดิจิทัล">สาขาวิชาการจัดการสำนักงานดิจิทัล (ปวช.)</option>
                            <option value="ปวช. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์">สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ (ปวช.)</option>
                          </optgroup>
                          <optgroup label="๔. ฝ่ายวิชาการ (ปวส.)">
                            <option value="ปวส. สาขาวิชาเทคนิคเครื่องกล">สาขาวิชาเทคนิคเครื่องกล (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเทคนิคการผลิต">สาขาวิชาเทคนิคการผลิต (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเทคนิคโลหะ">สาขาวิชาเทคนิคโลหะ (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาไฟฟ้า">สาขาวิชาไฟฟ้า (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาโยธา">สาขาวิชาโยธา (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาการบัญชี">สาขาวิชาการบัญชี (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์">สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์ (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเทคนิคยานยนต์ไฟฟ้า">สาขาวิชาเทคนิคยานยนต์ไฟฟ้า (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล">สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาการตลาด">สาขาวิชาการตลาด (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาการโรงเเรม">สาขาวิชาการโรงเเรม (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์">สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถัง เเละสีรถยนต์">สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถัง เเละสีรถยนต์ (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาการจัดการโลจิสติกส์ เเละซัพพลายเชน">สาขาวิชาการจัดการโลจิสติกส์ เเละซัพพลายเชน (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาการจัดการสำนักงานดิจิทัล">สาขาวิชาการจัดการสำนักงานดิจิทัล (ปวส.)</option>
                            <option value="ปวส. สาขาวิชาคอมพิวเตอร์เกมเเละแอนิเมชั่น">สาขาวิชาคอมพิวเตอร์เกมเเละแอนิเมชั่น (ปวส.)</option>
                          </optgroup>`;

const finalContent = content.substring(0, tagStart) + newBlock + content.substring(fullEndIndex);
fs.writeFileSync(path, finalContent, 'utf8');
console.log("Successfully updated the Academic Division in super-admin.");
