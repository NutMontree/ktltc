"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Loader2, Info, AlertTriangle, CheckCircle2, User } from "lucide-react";
import { Popover, Badge, Empty, Button } from "antd";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";

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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : { readAll: true })
      });
      fetchNotifications();
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
      setOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => (n.isRead ?? n.read ?? false) === false).length;

  const content = (
    <div className="w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] overflow-hidden">
      {/* --- Premium Header --- */}
      <div className="relative px-6 py-5 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-zinc-900 dark:text-white uppercase tracking-tight leading-none">
              การแจ้งเตือน
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              {unreadCount > 0 ? `คุณมีข้อความใหม่ ${unreadCount} รายการ` : 'ไม่มีข้อความใหม่'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 shadow-sm"
            >
              <Check size={12} strokeWidth={3} />
              อ่านทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* --- Notification List --- */}
      <div className="max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-zinc-950/50">
        {loading && notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
              <Bell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 opacity-20" size={24} />
            </div>
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] animate-pulse">กำลังซิงค์ข้อมูล...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
             <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <Bell className="text-zinc-200 dark:text-zinc-800" size={40} strokeWidth={1} />
             </div>
             <p className="text-zinc-800 dark:text-zinc-200 font-black text-lg leading-tight uppercase tracking-tight">เงียบเหงาจัง...</p>
             <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2 font-medium">ยังไม่มีการแจ้งเตือนใหม่ในระบบ</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {notifications.slice(0, 10).map((n) => {
              const isRead = n.isRead ?? n.read ?? false;
              const title = n.title || (n.type === 'friend_request' ? 'คำขอเป็นเพื่อน' : n.type === 'friend_accept' ? 'ยอมรับเป็นเพื่อน' : 'การแจ้งเตือนระบบ');
              const message = n.message || (n.type === 'friend_request' ? `${n.fromName} ส่งคำขอเป็นเพื่อนกับคุณ` : n.type === 'friend_accept' ? `${n.fromName} ยอมรับคำขอเป็นเพื่อนของคุณแล้ว` : '');

              return (
                <div 
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`relative p-5 transition-all cursor-pointer group overflow-hidden ${
                    !isRead 
                      ? 'bg-white dark:bg-zinc-900 border-l-4 border-l-blue-600' 
                      : 'hover:bg-white dark:hover:bg-zinc-900 bg-transparent'
                  }`}
                >
                  {/* Glass highlight for unread */}
                  {!isRead && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full pointer-events-none"></div>
                  )}

                  <div className="flex gap-5">
                    <div className="relative shrink-0 mt-1">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 relative">
                        {n.fromImage ? (
                          <Image 
                            src={n.fromImage} 
                            fill
                            sizes="56px"
                            unoptimized
                            className="object-cover" 
                            alt={n.fromName || "User"} 
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                            <User className="text-zinc-400 dark:text-zinc-600" size={28} />
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-md ${
                        n.type === 'success' ? 'bg-emerald-500' :
                        n.type === 'warning' ? 'bg-amber-500' :
                        n.type === 'error' ? 'bg-rose-500' :
                        'bg-blue-600'
                      }`}>
                        {n.type === 'success' ? <CheckCircle2 className="text-white" size={14} strokeWidth={3} /> :
                         n.type === 'warning' ? <AlertTriangle className="text-white" size={14} strokeWidth={3} /> :
                         n.type === 'error' ? <AlertTriangle className="text-white" size={14} strokeWidth={3} /> :
                         <Bell className="text-white" size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm tracking-tight leading-tight mb-1 truncate ${
                          !isRead 
                            ? 'font-black text-zinc-900 dark:text-white' 
                            : 'font-bold text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {title}
                        </p>
                        {!isRead && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
                        )}
                      </div>
                      <p className={`text-[13px] leading-relaxed line-clamp-2 ${
                        !isRead 
                          ? 'text-zinc-600 dark:text-zinc-300 font-semibold' 
                          : 'text-zinc-400 dark:text-zinc-500 font-medium'
                      }`}>
                        {message}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: th })}
                        </span>
                        {!isRead && (
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">New</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Footer --- */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800">
        <button 
          className="w-full group flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-2xl transition-all duration-300"
          onClick={() => {
            router.push("/dashboard/notifications");
            setOpen(false);
          }}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
            {notifications.length > 0 ? `ดูทั้งหมด (${notifications.length})` : 'จัดการการแจ้งเตือน'}
          </span>
          <Info size={14} className="opacity-50 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="notification-popover"
      overlayStyle={{ maxWidth: 'calc(100vw - 24px)' }}
      styles={{
        container: {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
          padding: 0,
          borderRadius: '2rem',
          overflow: 'hidden',
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
      }}
      arrow={false}
    >
      <button className="relative w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 group">
        <Badge count={unreadCount} overflowCount={99} size="small" offset={[-2, 2]} className="notification-badge">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        </Badge>
      </button>
    </Popover>
  );
}

const popoverStyles = `
  .notification-popover {
    max-width: calc(100vw - 24px) !important;
    z-index: 1000 !important;
  }
  .notification-popover .ant-popover-content {
    max-width: calc(100vw - 24px) !important;
  }
  .notification-popover .ant-popover-inner {
    padding: 0 !important;
    overflow: hidden !important;
    border-radius: 2rem !important;
    /* Box shadow and border are handled by overlayInnerStyle prop */
  }
  
  /* Ensure children inherit the right theme context */
  .dark .notification-popover .ant-popover-inner {
    color: #ffffff !important;
  }
  
  /* Fix text color in Popover because Ant Design might override it */
  .dark .notification-popover .ant-popover-inner * {
    /* color: #f4f4f5 !important; */ /* Don't force all to white, let Tailwind handle it, but ensures container is right */
  }

  @media (max-width: 640px) {
    .notification-popover {
      left: 12px !important;
      right: 12px !important;
      width: auto !important;
      transform: none !important;
    }
    .notification-popover .ant-popover-inner {
      max-width: 100% !important;
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('notification-popover-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-popover-styles';
  style.innerHTML = popoverStyles;
  document.head.appendChild(style);
}
