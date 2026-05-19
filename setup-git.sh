#!/bin/bash
# setup-git.sh - สคริปต์ตั้งค่า .gitignore, แก้ไขสิทธิ์ไฟล์ (Permission Denied) และระบบ Auto Sync สำหรับ KTLTC

PROJECT_DIR="/home/ktltc/ktltc"
cd "$PROJECT_DIR" || exit 1

echo "=========================================================="
echo " เริ่มต้นตั้งค่า Git, แก้ไขสิทธิ์ไฟล์ และระบบ Auto Sync สำหรับ KTLTC"
echo "=========================================================="

# 1. แก้ไขปัญหา Permission Denied ของไฟล์ในโปรเจกต์
echo "1. กำลังแก้ไขสิทธิ์การเข้าถึงไฟล์ในโปรเจกต์ (Permission Denied)..."
echo "กรุณาใส่รหัสผ่านเครื่องหากระบบถาม (ใช้เพื่อทำการ chown / chmod สิทธิ์ของไฟล์)"
sudo chown -R ktltc:ktltc "$PROJECT_DIR"
sudo chmod -R u+rwX "$PROJECT_DIR"
echo "✔ แก้ไขสิทธิ์ไฟล์เรียบร้อยแล้ว!"

# 2. อัปเดต .gitignore ด้วยไฟล์ใหม่ที่เราเตรียมไว้
echo "2. กำลังอัปเดตไฟล์ .gitignore..."
if [ -f "new_gitignore" ]; then
    cp new_gitignore .gitignore 2>/dev/null || sudo cp new_gitignore .gitignore
    echo "✔ อัปเดต .gitignore เรียบร้อยแล้ว (ละเว้นทุกอย่างใน public/ ยกเว้น .gitkeep)"
else
    echo "❌ ไม่พบไฟล์ new_gitignore! กรุณาตรวจสอบอีกครั้ง"
    exit 1
fi

# 3. ทำการยกเลิกการติดตาม (untrack) ไฟล์ที่เคยอยู่ใน public/ ขึ้น GitHub ไปแล้ว
echo "3. กำลังยกเลิกการติดตามไฟล์เก่าๆ ในโฟลเดอร์ public/ จาก Git index..."
git rm -r --cached public/ 2>/dev/null || sudo -u ktltc git rm -r --cached public/
git add public/.gitkeep 2>/dev/null || sudo -u ktltc git add public/.gitkeep
echo "✔ ยกเลิกการติดตามไฟล์ใน public/ เรียบร้อยแล้ว"

# 4. ทดลองดึงโค้ดล่าสุด (Git Pull) เพื่อแก้ปัญหา Merge/Pull ล้มเหลวที่มีก่อนหน้านี้
echo "4. กำลังดึงโค้ดเวอร์ชันล่าสุดจาก GitHub (Git Pull)..."
git pull origin main
if [ $? -eq 0 ]; then
    echo "✔ ดึงโค้ดเวอร์ชันล่าสุดและเคลียร์ไฟล์สำเร็จแล้ว!"
else
    echo "⚠ คำเตือน: Git Pull ยังคงมีข้อผิดพลาด กรุณาตรวจสอบข้อความแสดงข้อผิดพลาดของ Git ด้านบน"
fi

# 5. สร้างสคริปต์ Auto Sync ไว้ใน scripts/git-sync.sh
SYNC_SCRIPT="$PROJECT_DIR/scripts/git-sync.sh"
echo "5. กำลังสร้างสคริปต์ Auto Sync ที่ $SYNC_SCRIPT..."

cat << 'EOF' > "$SYNC_SCRIPT"
#!/bin/bash
# git-sync.sh - สคริปต์ Auto Commit, Pull, และ Push ไปยัง GitHub อัตโนมัติ

PROJECT_DIR="/home/ktltc/ktltc"
cd "$PROJECT_DIR" || exit 1

# โหลด PATH เผื่อสำหรับ cron job
export PATH=$PATH:/usr/bin:/usr/local/bin

echo "[$(date)] --- เริ่มต้นการทำงาน Auto Sync ---"

# ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต / GitHub (ดึงข้อมูลล่าสุดมาก่อน)
git fetch origin main > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[$(date)] ❌ ไม่สามารถเชื่อมต่อกับ GitHub ได้ในขณะนี้ ข้ามการทำงาน..."
    exit 1
fi

# ตรวจสอบว่ามีความเปลี่ยนแปลงในเครื่องหรือไม่
if [[ -n $(git status -s) ]]; then
    echo "[$(date)] พบไฟล์ที่มีการแก้ไข! กำลังเตรียมอัปโหลด..."
    
    # สเตจไฟล์ทั้งหมด (จะละเว้นไฟล์ใน public/ ตาม .gitignore ใหม่โดยอัตโนมัติ)
    git add .
    
    # ทำการ commit อัตโนมัติ พร้อมระบุวันเวลา
    git commit -m "Auto-commit from Lenovo machine [$(date '+%Y-%m-%d %H:%M:%S')]"
    
    # ดึงโค้ดล่าสุดจาก GitHub และ rebase เพื่อป้องกัน conflict
    echo "[$(date)] กำลัง Pull โค้ดล่าสุดจาก GitHub..."
    git pull --rebase origin main
    
    # ดันโค้ดขึ้น GitHub
    echo "[$(date)] กำลัง Push โค้ดขึ้น GitHub..."
    git push origin main
    echo "[$(date)] ✔ อัปโหลดข้อมูลและเชื่อมต่อ GitHub สำเร็จ!"
else
    # หากไม่มีการแก้ไขใดๆ ในเครื่อง ให้ Pull โค้ดล่าสุดจาก GitHub เผื่อมีเครื่องอื่นแก้ไข
    echo "[$(date)] ไม่มีไฟล์แก้ไขในเครื่อง กำลังดึงโค้ดล่าสุดเพื่อ Sync ตลอดเวลา..."
    git pull origin main
    echo "[$(date)] ✔ ดึงโค้ดล่าสุดเรียบร้อยแล้ว"
fi

echo "[$(date)] --- สิ้นสุดการทำงาน Auto Sync ---"
EOF

# ตั้งสิทธิ์การรันสคริปต์
chmod +x "$SYNC_SCRIPT"
sudo chown ktltc:ktltc "$SYNC_SCRIPT"
echo "✔ สร้างสคริปต์ Auto Sync เรียบร้อยแล้ว"

# 6. ตั้งค่า Cron Job เพื่อรันอัตโนมัติทุกๆ 2 นาที
echo "6. กำลังตั้งค่า Cron Job เพื่อรันสคริปต์ทุกๆ 2 นาที..."
CRON_JOB="*/2 * * * * /bin/bash $SYNC_SCRIPT >> $PROJECT_DIR/git-sync.log 2>&1"

# ตรวจสอบว่ามีงานซ้ำใน crontab หรือไม่
(crontab -l 2>/dev/null | grep -F "git-sync.sh") >/dev/null
if [ $? -eq 0 ]; then
    echo "✔ ตารางการรัน (Cron Job) มีอยู่แล้วในระบบ"
else
    # ทำการบันทึกงานใหม่ลงไปใน crontab ของระบบ
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✔ เพิ่ม Cron Job สำเร็จ! (รันอัปเดตและเชื่อมต่อ GitHub อัตโนมัติทุกๆ 2 นาที)"
fi

echo "=========================================================="
echo " ตั้งค่าเสร็จสิ้นสมบูรณ์!"
echo "----------------------------------------------------------"
echo "👉 คุณสามารถทดลองสั่ง Sync ด้วยตนเองได้โดยรันคำสั่ง:"
echo "   bash $SYNC_SCRIPT"
echo ""
echo "👉 และตรวจสอบประวัติการทำงาน/ประวัติการเชื่อมต่อได้ที่ไฟล์ล็อก:"
echo "   tail -f $PROJECT_DIR/git-sync.log"
echo "=========================================================="
