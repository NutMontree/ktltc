"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  UserOutlined, 
  SearchOutlined, 
  TeamOutlined, 
  ArrowLeftOutlined,
  UserAddOutlined,
  CheckCircleFilled,
  GlobalOutlined
} from "@ant-design/icons";
import { Input, Badge, Empty, message, Spin } from "antd";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
  username: string;
  role: string;
  image?: string;
  position?: string;
  department?: string;
  friends?: string[];
}

export default function MembersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [myFriends, setMyFriends] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, profileRes] = await Promise.all([
        fetch("/api/users/all"),
        session?.user ? fetch(`/api/users/${(session.user as any).id}`) : Promise.resolve(null)
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        const arr: User[] = data.users || [];
        // สุ่มลำดับด้วย Fisher-Yates
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setUsers(arr);
      }

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        setMyFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Fetch members error:", error);
      message.error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.position?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!session) {
      message.warning("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId }),
      });
      if (res.ok) {
        message.success("ส่งคำขอเป็นเพื่อนแล้ว");
        fetchData();
      } else {
        const error = await res.json();
        message.error(error.error || "ไม่สามารถส่งคำขอได้");
      }
    } catch (error) {
      console.error("Request friend error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 sticky top-20 z-30 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <ArrowLeftOutlined />
            </button>
            <div>
              <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <TeamOutlined className="text-blue-500" /> สมาชิกทั้งหมด
              </h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{users.length} รายชื่อในระบบ</p>
            </div>
          </div>

          <div className="w-full sm:w-72 relative">
            <Input
              prefix={<SearchOutlined className="text-zinc-400" />}
              placeholder="ค้นหาชื่อ สังกัด หรือตำแหน่ง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl h-10 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Spin size="large" />
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-[0.2em] animate-pulse">กำลังโหลดสมาชิก...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center">
            <Empty description={<span className="text-zinc-400 font-bold">ไม่พบรายชื่อที่ต้องการค้นหา</span>} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredUsers.map((u) => {
              const isMe = String((session?.user as any)?.id) === String(u._id);
              const isFriend = myFriends.some(fId => String(fId) === String(u._id));

              return (
                <div 
                  key={u._id}
                  onClick={() => router.push(`/dashboard/profile/${u._id}`)}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-none group-hover:rounded-2xl transition-all duration-500">
                    {u.image ? (
                      <img src={u.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={u.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserOutlined className="text-5xl text-zinc-200 dark:text-zinc-700" />
                      </div>
                    )}
                    
                    {/* Badge for online status or roles if needed */}
                    <div className="absolute top-2 right-2">
                       {isFriend && (
                          <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg">
                            เพื่อน
                          </div>
                       )}
                    </div>
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="font-black text-sm text-zinc-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {u.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3 truncate">
                      {u.position || u.role}
                    </p>

                    <div className="flex flex-col gap-2">
                      {!isMe && !isFriend && (
                        <button 
                          onClick={(e) => handleAddFriend(e, u._id)}
                          className="w-full py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white font-black text-[10px] transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserAddOutlined /> เพิ่มเพื่อน
                        </button>
                      )}
                      {isMe && (
                        <div className="w-full py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-black text-[10px] flex items-center justify-center gap-1.5">
                          <UserOutlined /> โปรไฟล์ของคุณ
                        </div>
                      )}
                      {isFriend && (
                        <div className="w-full py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-black text-[10px] flex items-center justify-center gap-1.5">
                          <CheckCircleFilled /> เป็นเพื่อนกันแล้ว
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
