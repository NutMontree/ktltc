"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Check, 
  Loader2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Trash2, 
  Inbox,
  ArrowLeft,
  Search,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Notification {
  _id: string;
  title?: string;
  message?: string;
  type: string;
  isRead?: boolean;
  read?: boolean;
  fromName?: string;
  fromImage?: string;
  targetUrl?: string;
  from?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status]);

  const markAsRead = async (id?: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : { readAll: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => 
          (id ? n._id === id : true) ? { ...n, isRead: true, read: true } : n
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id?: string) => {
    try {
      const url = id ? `/api/notifications?id=${id}` : `/api/notifications?all=true`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (id) {
          setNotifications(prev => prev.filter(n => n._id !== id));
        } else {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    const isRead = n.isRead ?? n.read ?? false;
    if (!isRead) {
      markAsRead(n._id);
    }
    
    let url = n.targetUrl;
    if (!url) {
      if (n.type === 'friend_request' || n.type === 'friend_accept') {
        url = `/dashboard/profile/${n.from}`;
      }
    }
    
    if (url) {
      router.push(url);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !(n.isRead ?? n.read ?? false);
    return true;
  });

  const unreadCount = notifications.filter(n => !(n.isRead ?? n.read ?? false)).length;

  if (status === "loading" || (status === "authenticated" && loading && notifications.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          กำลังโหลดการแจ้งเตือน...
        </p>
      </div>
    );
  }

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-12">
      <DashboardHeader user={user} />

      <div className="max-w-4xl mx-auto">
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">ย้อนกลับ</span>
            </button>
            <h1 className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase italic">
              Notifications <span className="text-blue-600 not-italic">Center</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1">
              จัดการข่าวสารและการแจ้งเตือนทั้งหมดของคุณ
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
              >
                อ่านทั้งหมด
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนทั้งหมด?")) {
                    deleteNotification();
                  }
                }}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
          <button 
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            ทั้งหมด ({notifications.length})
          </button>
          <button 
            onClick={() => setFilter("unread")}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "unread" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            ยังไม่ได้อ่าน ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-20 text-center bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 border-dashed"
              >
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Inbox className="text-zinc-300 dark:text-zinc-700" size={40} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">ไม่มีการแจ้งเตือน</h3>
                <p className="text-zinc-500 mt-2 font-medium">คุณได้จัดการการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว</p>
              </motion.div>
            ) : (
              filteredNotifications.map((n) => {
                const isRead = n.isRead ?? n.read ?? false;
                const title = n.title || (n.type === 'friend_request' ? 'คำขอเป็นเพื่อน' : n.type === 'friend_accept' ? 'ยอมรับเป็นเพื่อน' : 'การแจ้งเตือน');
                const message = n.message || (n.type === 'friend_request' ? `${n.fromName} ส่งคำขอเป็นเพื่อนกับคุณ` : n.type === 'friend_accept' ? `${n.fromName} ยอมรับคำขอเป็นเพื่อนของคุณแล้ว` : '');

                return (
                  <motion.div
                    layout
                    key={n._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative group p-6 rounded-[2rem] border transition-all duration-300 ${
                      !isRead 
                        ? 'bg-blue-50/30 dark:bg-blue-900/5 border-blue-100/50 dark:border-blue-900/20 shadow-sm shadow-blue-500/5' 
                        : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex gap-6">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                          {n.fromImage ? (
                            <img src={n.fromImage} className="w-full h-full object-cover" alt={n.fromName} />
                          ) : (
                            <User className="text-zinc-300" size={32} />
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-lg ${
                          n.type === 'success' ? 'bg-emerald-500' :
                          n.type === 'warning' ? 'bg-amber-500' :
                          n.type === 'error' ? 'bg-rose-500' :
                          'bg-blue-500'
                        }`}>
                          {n.type === 'success' ? <CheckCircle2 className="text-white" size={16} /> :
                           n.type === 'warning' ? <AlertTriangle className="text-white" size={16} /> :
                           n.type === 'error' ? <Info className="text-white" size={16} /> :
                           <Bell className="text-white" size={16} />}
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className={`text-lg font-black tracking-tight ${!isRead ? 'text-zinc-950 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {title}
                          </h4>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: th })}
                          </span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
                          {message}
                        </p>
                        
                        <div className="flex items-center gap-4 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleNotificationClick(n)}
                            className="px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                          >
                            ดูรายละเอียด
                          </button>
                          {!isRead && (
                            <button 
                              onClick={() => markAsRead(n._id)}
                              className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline"
                            >
                              ทำเครื่องหมายว่าอ่านแล้ว
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(n._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all ml-auto"
                            title="ลบ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
