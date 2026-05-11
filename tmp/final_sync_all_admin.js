/**
 * final_sync_all_admin.js: สคริปต์สำหรับซิงค์รายการ "แผนก" (Department) ในทุกหน้า Admin
 * 
 * หน้าที่: 
 * - ค้นหา Tag <select> ที่เกี่ยวข้องกับการเลือกแผนกในไฟล์ต่างๆ (Super Admin, User Edit, Manage Roles)
 * - แทนที่รายการ <option> เดิมด้วยชุดข้อมูลแผนกที่อัปเดตใหม่ล่าสุด
 * - ช่วยประหยัดเวลาในการไล่แก้ทีละไฟล์เมื่อมีการเปลี่ยนชื่อแผนกหรือเพิ่มแผนกใหม่
 */

const fs = require('fs');

const selectContent = `                          <option value="ไม่มีสังกัด">- ไม่ระบุสังกัด -</option>
                          <option value="ผู้บริหารสถานศึกษา">
                            ผู้บริหารสถานศึกษา
                          </option>
                          <optgroup label="1. ฝ่ายบริหารทรัพยากร">
                            <option value="งานบริหารงานทั่วไป">
                              งานบริหารงานทั่วไป
                            </option>
                            <option value="งานบริหารและพัฒนาทรัพยากรบุคคล">
                              งานบริหารและพัฒนาทรัพยากรบุคคล
                            </option>
                            <option value="งานการเงิน">งานการเงิน</option>
                            <option value="งานการบัญชี">งานการบัญชี</option>
                            <option value="งานพัสดุ">งานพัสดุ</option>
                            <option value="งานอาคารสถานที่">งานอาคารสถานที่</option>
                            <option value="งานทะเบียน">งานทะเบียน</option>
                            <option value="งานแม่บ้าน/นักการ">
                              งานแม่บ้าน/นักการ
                            </option>
                          </optgroup>
                          <optgroup label="2. ฝ่ายยุทธศาสตร์และแผนงาน">
                            <option value="งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ">
                              งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ
                            </option>
                            <option value="งานมาตรฐานและการประกันคุณภาพ">
                              งานมาตรฐานและการประกันคุณภาพ
                            </option>
                            <option value="งานศูนย์ดิจิทัลและสื่อสารองค์กร">
                              งานศูนย์ดิจิทัลและสื่อสารองค์กร
                            </option>
                            <option value="งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์">
                              งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์
                            </option>
                            <option value="งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ">
                              งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ
                            </option>
                            <option value="งานติดตามและประเมินผล">
                              งานติดตามและประเมินผล
                            </option>
                          </optgroup>
                          <optgroup label="3. ฝ่ายพัฒนากิจการนักเรียน นักศึกษา">
                            <option value="งานกิจกรรมนักเรียนนักศึกษา">
                              งานกิจกรรมนักเรียนนักศึกษา
                            </option>
                            <option value="งานครูที่ปรึกษาและการแนะแนว">
                              งานครูที่ปรึกษาและการแนะแนว
                            </option>
                            <option value="งานปกครองและความปลอดภัยนักเรียนนักศึกษา">
                              งานปกครองและความปลอดภัยนักเรียนนักศึกษา
                            </option>
                            <option value="งานสวัสดิการนักเรียนนักศึกษา">
                              งานสวัสดิการนักเรียนนักศึกษา
                            </option>
                            <option value="งานโครงการพิเศษและการบริการ">
                              งานโครงการพิเศษและการบริการ
                            </option>
                          </optgroup>
                          <optgroup label="4. ฝ่ายวิชาการ">
                            <option value="งานพัฒนาหลักสูตรและการจัดการเรียนรู้">
                              งานพัฒนาหลักสูตรและการจัดการเรียนรู้
                            </option>
                            <option value="งานวัดผลและประเมินผล">
                              งานวัดผลและประเมินผล
                            </option>
                            <option value="งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ">
                              งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ
                            </option>
                            <option value="งานวิทยบริการและเทคโนโลยีการศึกษา">
                              งานวิทยบริการและเทคโนโลยีการศึกษา
                            </option>
                            <option value="งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา">
                              งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา
                            </option>
                            <option value="งานพัฒนาหลักสูตรสายเทคโนโลยีหรือสายปฏิบัติการ">
                              งานพัฒนาหลักสูตรสายเทคโนโลยีหรือสายปฏิบัติการ
                            </option>
                          </optgroup>
                          <optgroup label="5. ระดับชั้นประกาศนียบัตรวิชาชีพ (ปวช.)">
                            <option value="ปวช. สาขาวิชาการบัญชี">
                              สาขาวิชาการบัญชี (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาการตลาด">
                              สาขาวิชาการตลาด (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาการโรงเเรม">
                              สาขาวิชาการโรงเเรม (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาตัวถังเเละสีรถยนต์">
                              สาขาวิชาตัวถังเเละสีรถยนต์ (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล">
                              สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาช่างยนต์">
                              สาขาวิชาช่างยนต์ (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาช่างกลโรงงาน">
                              สาขาวิชาช่างกลโรงงาน (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาช่างเชื่อมโลหะ">
                              สาขาวิชาช่างเชื่อมโลหะ (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาช่างไฟฟ้า">
                              สาขาวิชาช่างไฟฟ้า (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาอิเล็กทรอนิกส์">
                              สาขาวิชาอิเล็กทรอนิกส์ (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชายานยนต์ไฟฟ้า">
                              สาขาวิชายานยนต์ไฟฟ้า (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาโยธา">
                              สาขาวิชาโยธา (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาโลจิสติกส์">
                              สาขาวิชาโลจิสติกส์ (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาการจัดการสำนักงานดิจิทัล">
                              สาขาวิชาการจัดการสำนักงานดิจิทัล (ปวช.)
                            </option>
                            <option value="ปวช. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์">
                              สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ (ปวช.)
                            </option>
                          </optgroup>
                          <optgroup label="6. ระดับชั้นประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)">
                            <option value="ปวส. สาขาวิชาเทคนิคเครื่องกล">
                              สาขาวิชาเทคนิคเครื่องกล (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเทคนิคการผลิต">
                              สาขาวิชาเทคนิคการผลิต (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเทคนิคโลหะ">
                              สาขาวิชาเทคนิคโลหะ (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาไฟฟ้า">
                              สาขาวิชาไฟฟ้า (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาโยธา">
                              สาขาวิชาโยธา (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาการบัญชี">
                              สาขาวิชาการบัญชี (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์">
                              สาขาวิชาเทคโนโลยีอิเล็กทรอนิกส์ (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเทคนิคยานยนต์ไฟฟ้า">
                              สาขาวิชาเทคนิคยานยนต์ไฟฟ้า (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล">
                              สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาการตลาด">
                              สาขาวิชาการตลาด (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาการโรงเเรม">
                              สาขาวิชาการโรงเเรม (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์">
                              สาขาวิชาเมคคาทรอนิกส์เเละหุ่นยนต์ (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถัง เเละสีรถยนต์">
                              สาขาวิชาเทคโนโลยีอุตสาหกรรมตัวถัง เเละสีรถยนต์ (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาการจัดการโลจิสติกส์ เเละซัพพลายเชน">
                              สาขาวิชาการจัดการโลจิสติกส์ เเละซัพพลายเชน (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาการจัดการสำนักงานดิจิทัล">
                              สาขาวิชาการจัดการสำนักงานดิจิทัล (ปวส.)
                            </option>
                            <option value="ปวส. สาขาวิชาคอมพิวเตอร์เกมเเละแอนิเมชั่น">
                              สาขาวิชาคอมพิวเตอร์เกมเเละแอนิเมชั่น (ปวส.)
                            </option>
                          </optgroup>`;

function updateFile(filePath, startMarker, endMarker) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);

    if (startIdx !== -1 && endIdx !== -1) {
        const fullEndIdx = endIdx + endMarker.length;
        const newContent = content.substring(0, startIdx + startMarker.length) + 
                           '\n' + selectContent + '\n' + 
                           content.substring(endIdx);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`Markers not found in ${filePath}`);
        // Log indices for debugging
        console.log(`Start index: ${startIdx}, End index: ${endIdx}`);
    }
}

// 1. Super Admin Page
updateFile(
    'd:/ktl/src/app/dashboard/super-admin/page.tsx',
    'className="text-xs font-bold border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-2.5 outline-none text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 focus:border-blue-500 transition-all cursor-pointer max-w-[180px]"',
    '</select>'
);

// 2. User Edit Page
updateFile(
    'd:/ktl/src/app/dashboard/users/edit/[id]/page.tsx',
    'className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-sm font-bold text-slate-700 dark:text-zinc-200 outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"',
    '</select>'
);

// 3. Manage Roles Page
updateFile(
    'd:/ktl/src/app/(admin)/manage-roles/page.tsx',
    'className={`w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3.5 text-xs font-bold text-slate-700 dark:text-zinc-200 outline-none focus:border-blue-500 transition-all appearance-none ${isProtected ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"}`}',
    '</select>'
);
