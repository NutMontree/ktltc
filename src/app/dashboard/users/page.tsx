"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast"; // แนะนำให้ใช้ toast เพื่อความสวยงาม

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. ฟังก์ชันเปลี่ยนสถานะ (Active/Inactive)
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic Update
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );

      const res = await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error();
      toast.success("อัปเดตสถานะสำเร็จ");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
      fetchUsers();
    }
  };

  // 3. ฟังก์ชันเปลี่ยน Role
  const changeRole = async (id: string, newRole: string) => {
    if (!confirm(`ต้องการเปลี่ยนสิทธิ์เป็น ${newRole} ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("เปลี่ยนสิทธิ์สำเร็จ");
        fetchUsers();
      }
    } catch (error) {
      toast.error("เปลี่ยนสิทธิ์ไม่สำเร็จ");
    }
  };

  // 4. ฟังก์ชันลบผู้ใช้ (เพิ่มใหม่)
  const handleDeleteUser = async (id: string, name: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("ลบผู้ใช้งานเรียบร้อยแล้ว");
        setUsers((prev) => prev.filter((user) => user._id !== id));
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center max-w-[1600px] mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-10">
      {/* <Toaster position="top-right" /> */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            User_Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            จัดการสิทธิ์และอนุมัติการใช้งานสมาชิกในระบบ
          </p>
        </div>
        <Link
          href="/dashboard/users/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95"
        >
          + เพิ่มผู้ใช้ใหม่
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  User Info
                </th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Role Access
                </th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="p-6">
                    <div className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">
                      @{user.username} • {user.email}
                    </div>
                  </td>
                  <td className="p-6">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user._id, e.target.value)}
                      className="bg-slate-100 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold p-2.5 cursor-pointer dark:text-zinc-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em",
                      }}
                    >
                      <option value="user">USER (พนักงาน)</option>
                      <option value="editor">EDITOR (บรรณาธิการ)</option>
                      <option value="hr">HR (ฝ่ายบุคคล)</option>
                      <option value="staff">STAFF (เจ้าหน้าที่)</option>
                      <option value="teacher">TEACHER (ครู)</option>
                      <option value="janitor">JANITOR (แม่บ้าน/นักการ)</option>
                      <option value="director">DIRECTOR (ผู้บริหาร)</option>
                      <option value="admin">ADMIN (ผู้ดูแล)</option>
                      <option value="super_admin">SUPER_ADMIN</option>
                    </select>
                  </td>
                  <td className="p-6 text-center">
                    <button
                      onClick={() => toggleStatus(user._id, user.isActive)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ${
                        user.isActive
                          ? "bg-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-slate-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          user.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <div
                      className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${user.isActive ? "text-emerald-500" : "text-slate-400"}`}
                    >
                      {user.isActive ? "Active" : "Pending"}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/dashboard/users/edit/${user._id}`}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                        title="แก้ไขข้อมูล"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                        title="ลบผู้ใช้"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest italic">
              No users found in database
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
