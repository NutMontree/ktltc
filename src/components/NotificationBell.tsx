"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Loader2, Info, AlertTriangle, CheckCircle2, User } from "lucide-react";
import { Popover, Badge, Empty, Button } from "antd";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter } from "next/navigation";

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
    <div className="w-[calc(100vw-24px)] sm:w-[400px] max-w-[400px]">
      <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
        <h3 className="font-black text-lg text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">การแจ้งเตือน</h3>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => markAsRead()}
            className="text-blue-500 font-bold hover:text-blue-600"
          >
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-zinc-300" size={32} />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">กำลังโหลด...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-zinc-300" size={32} />
             </div>
             <p className="text-zinc-500 font-bold">ไม่มีการแจ้งเตือนในขณะนี้</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-zinc-800">
            {notifications.slice(0, 5).map((n) => {
              const isRead = n.isRead ?? n.read ?? false;
              const title = n.title || (n.type === 'friend_request' ? 'คำขอเป็นเพื่อน' : n.type === 'friend_accept' ? 'ยอมรับเป็นเพื่อน' : 'การแจ้งเตือน');
              const message = n.message || (n.type === 'friend_request' ? `${n.fromName} ส่งคำขอเป็นเพื่อนกับคุณ` : n.type === 'friend_accept' ? `${n.fromName} ยอมรับคำขอเป็นเพื่อนของคุณแล้ว` : '');

              return (
                <div 
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer relative group ${!isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                        {n.fromImage ? (
                          <img src={n.fromImage} className="w-full h-full object-cover" alt={n.fromName} />
                        ) : (
                          <User className="text-zinc-300" size={24} />
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center ${
                        n.type === 'success' ? 'bg-emerald-500' :
                        n.type === 'warning' ? 'bg-amber-500' :
                        n.type === 'error' ? 'bg-rose-500' :
                        'bg-blue-500'
                      }`}>
                        {n.type === 'success' ? <CheckCircle2 className="text-white" size={12} /> :
                         n.type === 'warning' ? <AlertTriangle className="text-white" size={12} /> :
                         n.type === 'error' ? <Info className="text-white" size={12} /> :
                         <Bell className="text-white" size={12} />}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm font-black ${!isRead ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                        {title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed break-words">
                        {message}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: th })}
                      </p>
                    </div>
                    {!isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t dark:border-zinc-800 text-center">
        {notifications.length > 5 ? (
          <button 
            className="w-full text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] hover:text-blue-700 dark:hover:text-blue-300 transition-all py-1"
            onClick={() => {
              router.push("/dashboard/notifications");
              setOpen(false);
            }}
          >
            ดูการแจ้งเตือนทั้งหมด ({notifications.length})
          </button>
        ) : (
          <button 
            className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
            onClick={() => setOpen(false)}
          >
            ปิดหน้านี้
          </button>
        )}
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
      arrow={false}
    >
      <button className="relative p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 group">
        <Badge count={unreadCount} overflowCount={99} size="small" offset={[-2, 2]} className="notification-badge">
          <Bell size={22} className="group-hover:rotate-12 transition-transform" />
        </Badge>
      </button>
    </Popover>
  );
}

const popoverStyles = `
  .notification-popover {
    max-width: calc(100vw - 24px) !important;
  }
  .notification-popover .ant-popover-content {
    max-width: calc(100vw - 24px) !important;
  }
  .notification-popover .ant-popover-inner {
    padding: 0 !important;
    overflow: hidden !important;
    border-radius: 1.5rem !important;
  }
  @media (max-width: 640px) {
    .notification-popover {
      left: 12px !important;
      right: 12px !important;
      width: calc(100vw - 24px) !important;
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('notification-popover-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-popover-styles';
  style.innerHTML = popoverStyles;
  document.head.appendChild(style);
}
