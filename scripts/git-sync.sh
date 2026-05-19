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
