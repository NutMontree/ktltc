import { unstable_cache } from "next/cache";
import clientPromise from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { getPublicDir } from "@/lib/cwd";

const execAsync = promisify(exec);

export const getCachedDashboardStats = unstable_cache(async (userRole: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const hasAccess = rolePerms?.permissions?.access_dashboard || userRole === "super_admin";

    if (!hasAccess) {
      // Fallback for legacy roles if role_permissions not set up
      const legacyRoles = ["admin", "editor"];
      if (!legacyRoles.includes(userRole || "")) {
        return { error: "Unauthorized" };
      }
    }

    // 1. Fetch counts from MongoDB
    const [
      totalNews,
      totalNav,
      totalPages,
      totalBanners,
      totalUsers,
      totalPendingQA,
      totalDriveFiles,
      totalDriveFolders,
      activeUsers,
      activeVisitors,
    ] = await Promise.all([
      db.collection("news").countDocuments(),
      db.collection("navbar").countDocuments({ parentId: null }),
      db.collection("pages").countDocuments(),
      db.collection("banners").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("questions").countDocuments({ status: "pending" }),
      db.collection("drive_files").countDocuments(),
      db.collection("drive_folders").countDocuments(),
      db
        .collection("users")
        .countDocuments({ lastActiveAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } }),
      db.collection("visitors_live").countDocuments(),
    ]);

    // 2. Media Stats (Image Count from News + Drive)
    const [newsImageStats, driveImageCount] = await Promise.all([
      db
        .collection("news")
        .aggregate([
          {
            $project: {
              imageCount: {
                $add: [
                  { $cond: { if: { $isArray: "$images" }, then: { $size: "$images" }, else: 0 } },
                  {
                    $cond: {
                      if: { $isArray: "$announcementImages" },
                      then: { $size: "$announcementImages" },
                      else: 0,
                    },
                  },
                ],
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$imageCount" } } },
        ])
        .toArray(),
      db.collection("drive_files").countDocuments({ type: { $regex: /^image\//i } }),
    ]);

    const totalImagesCount =
      (newsImageStats.length > 0 ? newsImageStats[0].total : 0) + driveImageCount;

    // 3. Infrastructure Usage (MongoDB)
    const dbStats = await db.stats();
    const dbSizeMB = (dbStats.storageSize / (1024 * 1024)).toFixed(2);

    // 4. Local Storage & DB Quotas
    let storageUsageMB = "0.00";
    let storageLimitMB = 20000; // Default fallback
    let dbLimitMB = 0; // Default unlimited for DB
    let serverTotalMB = 0; // Real disk capacity
    let serverUsedMB = 0;
    let serverAvailableMB = 0;
    let cpuUsage = "0";
    let ramUsage = { total: 0, used: 0, percent: 0 };
    let storageDetails: { folder: string, size: number }[] = [];

    try {
      // Fetch custom limits from database
      const [storageLimit, dbLimit] = await Promise.all([
        db.collection("site_settings").findOne({ key: "storage_limit_mb" }),
        db.collection("site_settings").findOne({ key: "db_limit_mb" }),
      ]);

      if (storageLimit) {
        storageLimitMB = parseFloat(storageLimit.value);
        if (isNaN(storageLimitMB)) storageLimitMB = 20000;
      }

      if (dbLimit) {
        dbLimitMB = parseFloat(dbLimit.value);
        if (isNaN(dbLimitMB)) dbLimitMB = 0;
      }

      // 3. Storage Calculation (Stale-While-Revalidate caching)
      let totalBytes = 0;
      try {
        const cacheDoc = await db.collection("sys_cache").findOne({ key: "storage_size" });
        const now = Date.now();
        const cacheTTL = 5 * 60 * 1000; // 5 minutes
        
        if (cacheDoc && cacheDoc.totalBytes !== undefined) {
          totalBytes = cacheDoc.totalBytes;
        }

        if (cacheDoc && cacheDoc.details) {
          storageDetails = cacheDoc.details;
        }

        // If cache is expired or missing, trigger a background calculation
        if (!cacheDoc || now - (cacheDoc.updatedAt || 0) > cacheTTL) {
          // Fire and forget (do not await)
          (async () => {
            try {
              const fs = require("fs");
              const path = require("path");
              const publicDir = getPublicDir();
              const foldersToMeasure = [
                "uploads", "images", "pdf", "ktltc_drive", "attendance_photos",
                "dve_media", "dve_evidence", "user_profiles", "user_covers", "ita_uploads", "posts"
              ];
              let calcBytes = 0;

              const getFolderSize = async (dirPath: string): Promise<number> => {
                try {
                  const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
                  const sizes = await Promise.all(
                    files.map(async (file: any) => {
                      const fullPath = path.join(dirPath, file.name);
                      if (file.isDirectory()) {
                        return await getFolderSize(fullPath);
                      } else {
                        const stats = await fs.promises.stat(fullPath);
                        return stats.size;
                      }
                    })
                  );
                  return sizes.reduce((acc: number, curr: number) => acc + curr, 0);
                } catch (e) {
                  return 0;
                }
              };

              const folderDetails = await Promise.all(
                foldersToMeasure.map(async (folder) => {
                  // Defeat static analysis with a function
                  const getPath = (d: string, f: string) => `${d}/${f}`;
                  const folderPath = getPath(publicDir, folder);
                  try {
                    let exists = true;
                    await fs.promises.access(folderPath).catch(() => { exists = false; });
                    if (exists) {
                      const size = await getFolderSize(folderPath);
                      return { folder, size };
                    }
                  } catch (e) { }
                  return { folder, size: 0 };
                })
              );
              calcBytes = folderDetails.reduce((acc, curr) => acc + curr.size, 0);

              // Update cache
              await db.collection("sys_cache").updateOne(
                { key: "storage_size" },
                { $set: { totalBytes: calcBytes, details: folderDetails, updatedAt: Date.now() } },
                { upsert: true }
              );
            } catch (err) {
              console.error("Background storage calculation failed:", err);
            }
          })();
        }
      } catch (err) {
        console.error("Cache read error:", err);
      }

      storageUsageMB = (totalBytes / (1024 * 1024)).toFixed(2);

      // 4. Get real disk stats and Lenovo Host Info
      try {
        const os = require("os");
        const fs = require("fs");
        const publicDir = getPublicDir();

        // 4.2 Get CPU, RAM, & Real Disk Stats
        const isLinux = os.platform() === 'linux';

        if (isLinux) {
          // --- รันบนเซิร์ฟเวอร์ Linux โดยตรง (ใช้ค่า Real-time จาก OS) ---
          try {
            // RAM (ใช้ free -m เพื่อให้ตรงกับ htop/system monitor 100%)
            const { stdout: freeOutput } = await execAsync('free -m');
            const memLine = freeOutput.split('\n').find((line: string) => line.startsWith('Mem:'));
            if (memLine) {
              const parts = memLine.trim().split(/\s+/);
              const total = parseInt(parts[1], 10);
              const used = parseInt(parts[2], 10); 
              ramUsage = {
                total,
                used,
                percent: Math.round((used / total) * 100),
              };
            } else {
              throw new Error("free output parse failed");
            }
          } catch(e) {
            // fallback
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            ramUsage = {
              total: Math.round(totalMem / (1024 * 1024)),
              used: Math.round((totalMem - freeMem) / (1024 * 1024)),
              percent: Math.round(((totalMem - freeMem) / totalMem) * 100),
            };
          }

          try {
            // CPU (ใช้ top เพื่อดึงค่า current load จริงๆ)
            const { stdout: topOutput } = await execAsync('top -bn1 | grep "Cpu(s)"');
            const match = topOutput.match(/([\d.]+)\s+id/);
            if (match && match[1]) {
              const idle = parseFloat(match[1]);
              cpuUsage = (100 - idle).toFixed(1);
            } else {
              throw new Error("top output parse failed");
            }
          } catch(e) {
            // fallback
            const cpus = os.cpus();
            if (cpus && cpus.length > 0) {
              let active = 0, total = 0;
              cpus.forEach((cpu: any) => {
                active += cpu.times.user + cpu.times.sys;
                total += cpu.times.user + cpu.times.sys + cpu.times.idle;
              });
              cpuUsage = ((active / total) * 100).toFixed(1);
            } else {
              cpuUsage = "1";
            }
          }

          try {
            // Disk (ใช้ df เพื่อให้ตรงกับหน้าจอ Linux 100%)
            const { stdout: dfOutput } = await execAsync('df -m /');
            const lines = dfOutput.trim().split('\n');
            if (lines.length > 1) {
              const parts = lines[1].trim().split(/\s+/);
              serverTotalMB = parseInt(parts[1], 10);
              serverUsedMB = parseInt(parts[2], 10);
              serverAvailableMB = parseInt(parts[3], 10);
            } else {
              throw new Error("df parse failed");
            }
          } catch(e) {
            if (fs.statfsSync) {
              try {
                const stats = fs.statfsSync(publicDir);
                serverTotalMB = Math.round((stats.blocks * stats.bsize) / (1024 * 1024));
                serverAvailableMB = Math.round((stats.bavail * stats.bsize) / (1024 * 1024));
                serverUsedMB = serverTotalMB - serverAvailableMB;
              } catch (e2) {}
            }
          }
        } else {
          // --- รันบน PC (ดึงข้อมูลพื้นฐานจาก MongoDB) ---
          try {
            const adminDb = db.admin();
            const hostInfo = await adminDb.command({ hostInfo: 1 });
            ramUsage = {
              total: hostInfo.extra.memSizeMB || 0,
              used: 0,
              percent: 0,
            };
            // แสดงเลข 1 เพื่อให้เข็มไมล์ขยับ (แทนสถานะเชื่อมต่อได้)
            cpuUsage = "1";
          } catch (mongoErr: any) {
            if (mongoErr.code === 13 || mongoErr.message?.includes("not authorized")) {
              console.warn(
                "⚠️ MongoDB user is not authorized on admin db for hostInfo (falling back to OS stats)",
              );
            } else {
              console.error("MongoDB HostInfo Error:", mongoErr);
            }
            ramUsage = {
              total: Math.round(os.totalmem() / (1024 * 1024)),
              used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024)),
              percent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
            };

            // Fallback CPU แบบง่ายๆ
            const cpus = os.cpus();
            if (cpus && cpus.length > 0) {
              let active = 0,
                total = 0;
              cpus.forEach((cpu: any) => {
                active += cpu.times.user + cpu.times.sys;
                total += cpu.times.user + cpu.times.sys + cpu.times.idle;
              });
              cpuUsage = ((active / total) * 100).toFixed(1);
            } else {
              cpuUsage = "1";
            }
          }
        }
      } catch (infraErr) {
        console.error("Infrastructure Check Error:", infraErr);
      }
    } catch (err) {
      console.error("General Stats Calculation Error:", err);
    }

    return {
      totalNews,
      totalNav,
      totalPages,
      totalBanners,
      totalImagesCount,
      totalDriveFiles,
      totalDriveFolders,
      dbSizeMB,
      dbLimitMB: dbLimitMB,
      cloudUsageMB: storageUsageMB, // Keeping same key for frontend compatibility
      cloudLimitMB: storageLimitMB,
      storageDetails: storageDetails,
      serverTotalMB: serverTotalMB,
      serverUsedMB: serverUsedMB,
      serverAvailableMB: serverAvailableMB,
      cpuUsage: cpuUsage,
      ramUsage: ramUsage,
      totalPendingQA,
      totalUsers,
      activeUsers,
      activeVisitors,
    };
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return { error: "Internal Server Error" };
  }
}, ["admin-dashboard-stats"], { revalidate: 60, tags: ["admin-dashboard-stats"] });

export const getCachedMenus = unstable_cache(async () => {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const menus = await db.collection("custom_menus").find({}).toArray();
    return JSON.parse(JSON.stringify(menus));
  } catch (err) {
    return [];
  }
}, ["admin-menus-cache"], { revalidate: 60, tags: ["admin-menus-cache"] });

export const getCachedPermissions = unstable_cache(async (role: string, department?: string, faction?: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const dbPermission = await db.collection("role_permissions").findOne({ role });
    
    let deptPermission = null;
    if (department) {
      deptPermission = await db.collection("department_permissions").findOne({ department });
    }
    
    let factionPermission = null;
    if (faction) {
      factionPermission = await db.collection("department_permissions").findOne({ department: faction });
    }
    
    // Default fallback
    const permissions = {
      access_dashboard: ["super_admin", "admin", "hr", "director", "editor", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs"].includes(role),
      manage_users: ["super_admin"].includes(role),
      manage_news: ["super_admin", "admin", "editor"].includes(role),
      manage_home: ["super_admin", "admin"].includes(role),
      manage_navbar: ["super_admin", "admin"].includes(role),
      manage_pages: ["super_admin", "editor"].includes(role),
      manage_attendance: ["super_admin", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs"].includes(role),
      manage_qa: ["super_admin", "admin"].includes(role),
      manage_system: ["super_admin"].includes(role),
      student_dashboard: ["super_admin", "admin", "deputy_student_affairs", "student"].includes(role),
      manage_flagpole_data: ["super_admin", "admin", "deputy_student_affairs"].includes(role),
      manage_flagpole_settings: ["super_admin", "admin", "deputy_student_affairs"].includes(role),
      access_dve_teacher: ["super_admin", "admin", "teacher"].includes(role),
      access_dve_student: ["super_admin", "admin", "student"].includes(role),
      manage_supervision_requests: ["super_admin"].includes(role),
      access_teacher_verification: ["super_admin"].includes(role),
      access_teacher_dashboard: ["super_admin"].includes(role),
      access_lesson_plans: ["super_admin"].includes(role),
      access_dpa_evaluation: ["super_admin"].includes(role),
      access_plc: ["super_admin"].includes(role),
      access_student_care: ["super_admin"].includes(role),
      manage_attendance_dashboard: ["super_admin"].includes(role),
      manage_attendance_work_reports: ["super_admin"].includes(role),
      manage_attendance_leave_approvals: ["super_admin"].includes(role),
      ...(dbPermission?.permissions || {})
    };

    if (deptPermission?.permissions) {
      for (const [key, value] of Object.entries(deptPermission.permissions)) {
        if (value) {
          (permissions as any)[key] = true;
        }
      }
    }

    if (factionPermission?.permissions) {
      for (const [key, value] of Object.entries(factionPermission.permissions)) {
        if (value) {
          (permissions as any)[key] = true;
        }
      }
    }

    if (role === "super_admin") {
      permissions.manage_home = true;
      permissions.manage_users = true;
      permissions.manage_news = true;
      permissions.manage_navbar = true;
      permissions.manage_pages = true;
      permissions.manage_qa = true;
      permissions.manage_system = true;
      permissions.access_dashboard = true;
      permissions.student_dashboard = true;
      permissions.manage_attendance = true;
      permissions.manage_flagpole_data = true;
      permissions.manage_flagpole_settings = true;
      permissions.access_dve_teacher = true;
      permissions.access_dve_student = true;
      permissions.manage_supervision_requests = true;
      permissions.access_teacher_verification = true;
      permissions.access_teacher_dashboard = true;
      permissions.access_lesson_plans = true;
      permissions.access_dpa_evaluation = true;
      permissions.access_plc = true;
      permissions.access_student_care = true;
      permissions.manage_attendance_dashboard = true;
      permissions.manage_attendance_work_reports = true;
      permissions.manage_attendance_leave_approvals = true;
    }

    return JSON.parse(JSON.stringify(permissions));
  } catch (err) {
    return {};
  }
}, ["role-permissions-cache"], { revalidate: 60, tags: ["role-permissions-cache"] });
