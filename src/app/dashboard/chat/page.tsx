"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  Image as ImageIcon,
  Paperclip,
  ArrowLeft,
  User,
  Plus,
  Loader2,
  X,
  Clock,
  Sparkles,
  Users,
  UserPlus,
  Trash2,
  Info,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface Recipient {
  _id: string;
  name: string;
  username: string;
  image?: string;
  role: string;
  department?: string;
}

interface Chat {
  _id: string;
  participants: string[];
  recipient: Recipient | null;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSender: string | null;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  creatorId?: string | null;
  participantsDetails?: Recipient[];
}

interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  text: string;
  images?: string[];
  files?: { url: string; name: string; size?: number; type?: string }[];
  createdAt: string;
}

function ChatPageContent() {
  const { data: session, status } = useSession();
  const currentUserId = (session?.user as any)?.id || "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("u");
  const targetChatId = searchParams.get("c");
  const hasProcessedParam = useRef(false);

  // Chat UI states
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Attachment states
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ url: string; name: string; size: number; type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Create Group Modal States
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<Recipient[]>([]);
  const [groupUserSearchQuery, setGroupUserSearchQuery] = useState("");
  const [groupUserSearchResults, setGroupUserSearchResults] = useState<Recipient[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Group Details Drawer States
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [addMemberSearchQuery, setAddMemberSearchQuery] = useState("");
  const [addMemberSearchResults, setAddMemberSearchResults] = useState<Recipient[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);

  // Loading states
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileAttachmentRef = useRef<HTMLInputElement>(null);
  // Messages scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Format date nicely
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return "";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
    } catch (_) {
      return "";
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Poll for messages in active chat
  useEffect(() => { 
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?chatId=${activeChat._id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [activeChat]);

  // Poll for conversation list
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchChats = async (showLoading = false) => {
      if (showLoading) setLoadingChats(true);
      try {
        const res = await fetch("/api/chat/list");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setChats(data.chats);
          }
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        if (showLoading) setLoadingChats(false);
      }
    };

    fetchChats(true);
    const interval = setInterval(() => fetchChats(false), 3000); // Poll list every 3 seconds

    return () => clearInterval(interval);
  }, [status]);

  // Auto-select user or group chat from search query params (e.g. ?u=id or ?c=chatId)
  useEffect(() => {
    if ((!targetUserId && !targetChatId) || hasProcessedParam.current || loadingChats || !currentUserId) return;

    const autoSelectUser = async () => {
      hasProcessedParam.current = true;

      // 1. If targetChatId is provided, look for that specific conversation
      if (targetChatId) {
        const matchedChat = chats.find((c) => c._id === targetChatId);
        if (matchedChat) {
          setActiveChat(matchedChat);
          setShowMobileChat(true);
          return;
        }
      }

      // 2. If targetUserId is provided, check if there's an existing 1-on-1 private chat
      if (targetUserId) {
        const existingChat = chats.find(
          (c) => !c.isGroup && c.recipient?._id === targetUserId
        );

        if (existingChat) {
          setActiveChat(existingChat);
          setShowMobileChat(true);
          return;
        }

        // 3. If not in active chats, fetch the recipient profile details to start a new chat
        try {
          const res = await fetch(`/api/chat/users?q=${targetUserId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.users && data.users.length > 0) {
              const user = data.users[0];
              const tempChat: Chat = {
                _id: "new",
                participants: [currentUserId, user._id],
                recipient: user,
                lastMessage: "",
                lastMessageAt: new Date().toISOString(),
                lastMessageSender: null,
              };
              setActiveChat(tempChat);
              setMessages([]);
              setShowMobileChat(true);
            }
          }
        } catch (err) {
          console.error("Error auto-selecting chat user:", err);
        }
      }
    };

    if (chats.length >= 0) {
      autoSelectUser();
    }
  }, [targetUserId, targetChatId, chats, loadingChats, currentUserId]);

  // Scroll on messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dynamic CSS injector to optimize screen space for chat (hides footer, disables global window scroll)
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.id = "chat-page-override-style";
    styleEl.innerHTML = `
      footer {
        display: none !important;
      }
      .scroll-to-top, #scroll-up {
        display: none !important;
      }
      body, html {
        overflow: hidden !important;
        height: 100% !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById("chat-page-override-style");
      if (el) el.remove();
    };
  }, []);

  // Search users as query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/chat/users?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSearchResults(data.users);
          }
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search users for creating a group (Fetches all/searched users automatically when modal opens)
  useEffect(() => {
    if (!isCreateGroupModalOpen) {
      setGroupUserSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/chat/users?q=${encodeURIComponent(groupUserSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Filter out already selected users and self
            const filtered = data.users.filter(
              (u: any) => u._id !== currentUserId && !selectedGroupUsers.some((su) => su._id === u._id)
            );
            setGroupUserSearchResults(filtered);
          }
        }
      } catch (err) {
        console.error("Error searching group users:", err);
      }
    }, groupUserSearchQuery ? 400 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [groupUserSearchQuery, selectedGroupUsers, currentUserId, isCreateGroupModalOpen]);

  // Search users for adding to an existing group (Loads users who aren't in group by default)
  useEffect(() => {
    if (!isInviteMemberModalOpen || !activeChat) {
      setAddMemberSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/chat/users?q=${encodeURIComponent(addMemberSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Filter out existing participants of the active group
            const filtered = data.users.filter(
              (u: any) => !activeChat.participants.includes(u._id)
            );
            setAddMemberSearchResults(filtered);
          }
        }
      } catch (err) {
        console.error("Error searching add member users:", err);
      }
    }, addMemberSearchQuery ? 400 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [addMemberSearchQuery, activeChat, isInviteMemberModalOpen]);

  // Start chat with user
  const handleSelectUser = async (user: Recipient) => {
    setSearchQuery("");
    setSearchResults([]);

    // Check if we already have an active conversation with this user
    const existingChat = chats.find((c) => !c.isGroup && c.recipient?._id === user._id);

    if (existingChat) {
      setActiveChat(existingChat);
      setShowMobileChat(true);
      return;
    }

    // Otherwise create temporary local state for chat
    const tempChat: Chat = {
      _id: "new",
      participants: [currentUserId, user._id],
      recipient: user,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      lastMessageSender: null,
      isGroup: false,
    };

    setActiveChat(tempChat);
    setMessages([]);
    setShowMobileChat(true);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("กรุณากรอกชื่อกลุ่ม");
      return;
    }
    if (selectedGroupUsers.length === 0) {
      toast.error("กรุณาเลือกสมาชิกอย่างน้อย 1 คน");
      return;
    }

    setIsCreatingGroup(true);
    try {
      const res = await fetch("/api/chat/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: newGroupName.trim(),
          participantIds: selectedGroupUsers.map((u) => u._id),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(`สร้างกลุ่มแชท "${newGroupName}" สำเร็จ!`);
          setIsCreateGroupModalOpen(false);
          setNewGroupName("");
          setSelectedGroupUsers([]);
          setGroupUserSearchQuery("");
          setGroupUserSearchResults([]);
          
          // Refresh conversation list
          const listRes = await fetch("/api/chat/list");
          if (listRes.ok) {
            const listData = await listRes.json();
            if (listData.success) {
              setChats(listData.chats);
              // Find the newly created group and set it active
              const newGroup = listData.chats.find((c: any) => c._id === data.chat._id);
              if (newGroup) {
                setActiveChat(newGroup);
                setMessages([]);
                setShowMobileChat(true);
              }
            }
          }
        }
      } else {
        toast.error("ไม่สามารถสร้างกลุ่มแชทได้");
      }
    } catch (err) {
      console.error("Create group error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleAddMemberToGroup = async (targetUser: Recipient) => {
    if (!activeChat) return;

    // Check if user is already a member
    const isAlreadyMember = activeChat.participants.includes(targetUser._id);
    if (isAlreadyMember) {
      toast.error("ผู้ใช้นี้เป็นสมาชิกในกลุ่มอยู่แล้ว");
      return;
    }

    setIsAddingMember(true);
    try {
      const res = await fetch("/api/chat/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat._id,
          action: "add",
          targetUserId: targetUser._id,
        }),
      });

      if (res.ok) {
        toast.success(`เชิญ ${targetUser.name} เข้าร่วมกลุ่มสำเร็จ`);
        setAddMemberSearchQuery("");
        setAddMemberSearchResults([]);

        // Refresh conversation list and current chat
        const listRes = await fetch("/api/chat/list");
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.success) {
            setChats(listData.chats);
            const updatedChat = listData.chats.find((c: any) => c._id === activeChat._id);
            if (updatedChat) {
              setActiveChat(updatedChat);
            }
          }
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "ไม่สามารถเพิ่มสมาชิกได้");
      }
    } catch (err) {
      console.error("Add member error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMemberFromGroup = async (targetUserId: string, targetName: string) => {
    if (!activeChat) return;

    try {
      const res = await fetch("/api/chat/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat._id,
          action: "remove",
          targetUserId: targetUserId,
        }),
      });

      if (res.ok) {
        toast.success(`นำ ${targetName} ออกจากกลุ่มสำเร็จ`);

        // Refresh conversation list and current chat
        const listRes = await fetch("/api/chat/list");
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.success) {
            setChats(listData.chats);
            const updatedChat = listData.chats.find((c: any) => c._id === activeChat._id);
            if (updatedChat) {
              setActiveChat(updatedChat);
            }
          }
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "ไม่สามารถลบสมาชิกได้");
      }
    } catch (err) {
      console.error("Remove member error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Upload image handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "chat_attachments");

    try {
      setIsUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.secure_url) {
        setAttachedImages((prev) => [...prev, data.secure_url]);
        toast.success("อัปโหลดรูปภาพสำเร็จ");
      } else {
        toast.error(data.message || "อัปโหลดรูปภาพล้มเหลว");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload file handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "chat_attachments");

    try {
      setIsUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.secure_url) {
        setAttachedFiles((prev) => [
          ...prev,
          {
            url: data.secure_url,
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ]);
        toast.success("อัปโหลดไฟล์สำเร็จ");
      } else {
        toast.error(data.message || "อัปโหลดไฟล์ล้มเหลว");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteGroup = async () => {
    if (!activeChat) return;

    const isGroup = activeChat.isGroup;
    const displayName = isGroup ? activeChat.groupName : activeChat.recipient?.name;
    const confirmMessage = isGroup
      ? `คุณต้องการลบกลุ่มแชท "${displayName}" และประวัติการคุยทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
      : `คุณต้องการลบการสนทนาส่วนตัวกับคุณ "${displayName}" และล้างข้อความทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`/api/chat/groups?chatId=${activeChat._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const successMessage = isGroup
          ? `ลบกลุ่มแชท "${displayName}" เรียบร้อยแล้ว`
          : `ลบการสนทนาส่วนตัวเรียบร้อยแล้ว`;
        toast.success(successMessage);
        setActiveChat(null);
        setIsGroupInfoOpen(false);

        // Refresh conversation list
        const listRes = await fetch("/api/chat/list");
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.success) {
            setChats(listData.chats);
          }
        }
      } else {
        const errData = await res.json();
        toast.error(errData.error || "ไม่สามารถลบการสนทนาได้");
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) return;
    if (!activeChat) return;

    const originalInput = inputText;
    const originalAttachments = attachedImages;
    const originalFiles = attachedFiles;

    // Reset input states immediately to feel highly responsive
    setInputText("");
    setAttachedImages([]);
    setAttachedFiles([]);

    try {
      const payload: any = {
        text: originalInput,
        images: originalAttachments,
        files: originalFiles,
      };

      if (activeChat._id === "new") {
        payload.receiverId = activeChat.recipient?._id;
      } else {
        payload.chatId = activeChat._id;
      }

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // If this was a new conversation, configure it with actual chatId
          if (activeChat._id === "new") {
            const resolvedChat: Chat = {
              ...activeChat,
              _id: data.chatId,
              lastMessage: data.message.text || (originalFiles.length > 0 ? `ส่งไฟล์เอกสาร 📁 (${originalFiles[0].name})` : "ส่งรูปภาพ 📷"),
              lastMessageAt: data.message.createdAt,
              lastMessageSender: currentUserId,
            };
            setActiveChat(resolvedChat);
            // Refresh conversation list
            const chatsRes = await fetch("/api/chat/list");
            if (chatsRes.ok) {
              const chatsData = await chatsRes.json();
              if (chatsData.success) setChats(chatsData.chats);
            }
          }
          // Optimistically append the message to history
          setMessages((prev) => [...prev, data.message]);
        }
      } else {
        // Rollback states on failure
        setInputText(originalInput);
        setAttachedImages(originalAttachments);
        setAttachedFiles(originalFiles);
        toast.error("ไม่สามารถส่งข้อความได้");
      }
    } catch (err) {
      console.error("Send message error:", err);
      setInputText(originalInput);
      setAttachedImages(originalAttachments);
      setAttachedFiles(originalFiles);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Loading Screen for Auth status
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          กำลังเตรียมระบบแชท...
        </p>
      </div>
    );
  }

  // Not authenticated screen
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
        <MessageSquare className="w-16 h-16 text-zinc-300 dark:text-zinc-700 animate-bounce" />
        <h2 className="text-xl font-black text-zinc-800 dark:text-white">
          คุณยังไม่ได้เข้าสู่ระบบ
        </h2>
        <p className="text-zinc-500 max-w-sm text-sm">
          กรุณาเข้าสู่ระบบก่อน เพื่อเริ่มต้นส่งข้อความแชทคุยกับบุคลากรท่านอื่น
        </p>
        <a
          href="/login"
          className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg transition-transform active:scale-95"
        >
          เข้าสู่ระบบ
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-100px)] bg-transparent overflow-hidden px-2 py-2">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px] dark:bg-blue-600/5 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px] dark:bg-indigo-600/5 animate-pulse delay-700" />
      </div>

      <div className="max-w-6xl mx-auto w-full h-full flex gap-4 md:gap-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* ================= LEFT COLUMN: CONVERSATION LIST ================= */}
        <div
          className={`w-full md:w-[380px] h-full flex flex-col border-r border-zinc-200/40 dark:border-zinc-800/40 bg-white/30 dark:bg-zinc-950/20 ${showMobileChat ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 rounded-lg transition-colors mr-1 flex items-center justify-center active:scale-95"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-500" /> กล่องข้อความ
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all flex items-center justify-center active:scale-95"
                title="สร้างกลุ่มแชท"
              >
                <Users className="w-4 h-4 mr-1 shrink-0" />
                <Plus className="w-3 h-3 shrink-0" />
              </button>
              <span className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 rounded-full shrink-0">
                Real-time
              </span>
            </div>
          </div>

          {/* User Search Input */}
          <div className="p-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหารายชื่อผู้ใช้งาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* User Search Results List */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-4 right-4 top-16 z-55 max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1"
                >
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-xs font-bold text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> กำลังค้นหา...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs font-bold text-zinc-400">
                      ไม่พบรายชื่อผู้ใช้งาน
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-left transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-linear-to-tr from-blue-600 to-indigo-500 shrink-0">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-black uppercase">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                              {user.name}
                            </h4>
                            <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">
                              {user.role}
                            </span>
                          </div>
                          {user.department && (
                            <p className="text-[10px] font-medium text-zinc-400 truncate">
                              {user.department}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
            {loadingChats ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs font-bold">กำลังโหลดกล่องข้อความ...</span>
              </div>
            ) : chats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 dark:text-zinc-600 space-y-2">
                <MessageSquare className="w-8 h-8 opacity-40 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs font-black">ไม่มีการสนทนาในขณะนี้</p>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  ค้นหารายชื่อผู้ใช้งานด้านบนเพื่อเริ่มต้นคุย
                </p>
              </div>
            ) : (
              chats.map((chat) => {
                const recipient = chat.recipient;
                const isActive = activeChat && activeChat._id === chat._id;
                if (!chat.isGroup && !recipient) return null;

                return (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setActiveChat(chat);
                      setShowMobileChat(true);
                      setIsGroupInfoOpen(false); // Close details drawer when switching chats
                    }}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all duration-300 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 bg-white/30 dark:bg-zinc-900/10 border border-zinc-200/20 dark:border-zinc-800/20"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-zinc-200/20 shrink-0 shadow-md">
                      {chat.isGroup ? (
                        <div className="w-full h-full flex items-center justify-center text-white bg-linear-to-tr from-indigo-650 to-purple-600">
                          <Users className="w-5 h-5" />
                        </div>
                      ) : recipient?.image ? (
                        <img src={recipient.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white bg-linear-to-tr from-blue-600 to-indigo-500 text-base font-black uppercase">
                          {recipient?.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Excerpt Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-sm font-black truncate max-w-[120px] ${isActive ? "text-white" : "text-zinc-900 dark:text-white"}`}
                          >
                            {chat.isGroup ? chat.groupName : recipient?.name}
                          </span>
                          {chat.isGroup && (
                            <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded shrink-0 ${
                              isActive ? "bg-white/20 text-white" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            }`}>
                              กลุ่ม
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-bold ${isActive ? "text-blue-100" : "text-zinc-400"}`}
                        >
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-xs truncate ${isActive ? "text-blue-50" : "text-zinc-400 dark:text-zinc-500 font-medium"}`}
                        >
                          {chat.lastMessageSender === currentUserId ? "คุณ: " : ""}
                          {chat.lastMessage || "เริ่มคุยกันเลย!"}
                        </p>
                        {!isActive &&
                          chat.lastMessageSender !== currentUserId &&
                          chat.lastMessage && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0 ml-2" />
                          )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CHAT CONVERSATION WINDOW ================= */}
        <div
          className={`flex-1 h-full flex flex-col bg-transparent ${!showMobileChat ? "hidden md:flex" : "flex"}`}
        >
          {activeChat ? (
            <>
              {/* Recipient Window Header */}
              <div className="p-4 md:p-5 flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors md:hidden mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Recipient details */}
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden shadow-md shrink-0">
                    {activeChat.isGroup ? (
                      <div className="w-full h-full flex items-center justify-center text-white bg-linear-to-tr from-indigo-650 to-purple-600">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : activeChat.recipient?.image ? (
                      <img
                        src={activeChat.recipient.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white bg-linear-to-tr from-blue-600 to-indigo-500 text-base font-black uppercase">
                        {activeChat.recipient?.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm md:text-base font-black text-zinc-900 dark:text-white leading-none">
                        {activeChat.isGroup ? activeChat.groupName : activeChat.recipient?.name}
                      </h2>
                      {!activeChat.isGroup && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">
                          {activeChat.recipient?.role}
                        </span>
                      )}
                      {activeChat.isGroup && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-indigo-650 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-1.5 py-0.5 rounded-sm">
                          กลุ่มแชท
                        </span>
                      )}
                    </div>
                    {activeChat.isGroup ? (
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider leading-none">
                        สมาชิก {activeChat.participantsDetails?.length || activeChat.participants.length} คน
                      </p>
                    ) : activeChat.recipient?.department ? (
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider leading-none">
                        {activeChat.recipient.department}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeChat.isGroup ? (
                    <button
                      onClick={() => setIsGroupInfoOpen(!isGroupInfoOpen)}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                        isGroupInfoOpen
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <Info className="w-4 h-4 shrink-0" />
                      <span>ข้อมูลกลุ่ม</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450 leading-none">
                          Online
                        </span>
                      </div>
                      
                      <button
                        onClick={handleDeleteGroup}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-450 hover:text-rose-500 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                        title="ลบการสนทนาส่วนตัวถาวร"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            <div className="flex-1 flex overflow-hidden relative">
              {/* Left inner area: Messages + Input */}
              <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Messages Listing Thread */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-50/10 dark:bg-zinc-950/5">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 dark:text-zinc-600 space-y-3">
                      <div className="w-14 h-14 bg-blue-500/5 rounded-full flex items-center justify-center text-blue-500">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-zinc-800 dark:text-white">
                          ส่งข้อความทักทาย
                        </p>
                        <p className="text-xs font-medium text-zinc-400">
                          {activeChat.isGroup 
                            ? `นี่คือจุดเริ่มต้นของการพูดคุยภายในกลุ่ม ${activeChat.groupName}`
                            : `นี่คือจุดเริ่มต้นของการพูดคุยกับ ${activeChat.recipient?.name}`
                          }
                        </p>
                      </div>
                    </div>
                ) : (
                  messages.map((message, index) => {
                    const isMe = message.senderId === currentUserId;

                    // Group date changes
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showDateHeader =
                      !prevMsg || formatDate(prevMsg.createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id} className="space-y-3">
                        {/* Optional Date Divider */}
                        {showDateHeader && (
                          <div className="flex items-center justify-center my-6">
                            <span className="px-3.5 py-1 text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-500 rounded-full shadow-sm flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-zinc-400" />{" "}
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Bubble row */}
                        <div
                          className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {/* Profile thumbnail for other user */}
                          {!isMe && (
                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-linear-to-tr from-blue-600 to-indigo-500 border border-zinc-200/20 shadow-sm">
                              {activeChat.recipient?.image ? (
                                <img
                                  src={activeChat.recipient.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-black uppercase">
                                  {activeChat.recipient?.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            className={`flex flex-col max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`p-3.5 rounded-2xl text-sm font-medium shadow-sm transition-all duration-300 ${
                                isMe
                                  ? "bg-blue-600 text-white rounded-br-sm shadow-blue-600/10"
                                  : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-sm border border-zinc-200/50 dark:border-zinc-800/50"
                              }`}
                            >
                              {/* Attached Images */}
                              {message.images && message.images.length > 0 && (
                                <div className="grid gap-2 grid-cols-1 mb-2">
                                  {message.images.map((imgUrl, i) => (
                                    <a
                                      key={i}
                                      href={imgUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block max-w-sm rounded-xl overflow-hidden border border-zinc-200/20 shadow-md active:scale-95 transition-transform"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt="Chat Attachment"
                                        className="w-full max-h-56 object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* Attached Files */}
                              {message.files && message.files.length > 0 && (
                                <div className="grid gap-2 grid-cols-1 mb-2">
                                  {message.files.map((fileObj: any, i: number) => {
                                    const formattedSize = fileObj.size 
                                      ? (fileObj.size / (1024 * 1024)).toFixed(2) + " MB" 
                                      : "";
                                    return (
                                      <a
                                        key={i}
                                        href={fileObj.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={fileObj.name}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                                          isMe
                                            ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                                        }`}
                                      >
                                        <div className={`p-2 rounded-lg ${isMe ? "bg-white/20" : "bg-blue-500/10 text-blue-500"}`}>
                                          <Paperclip className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-black truncate max-w-[160px] leading-tight">
                                            {fileObj.name}
                                          </p>
                                          {formattedSize && (
                                            <p className={`text-[9px] font-bold ${isMe ? "text-blue-200" : "text-zinc-400"}`}>
                                              {formattedSize}
                                            </p>
                                          )}
                                        </div>
                                        <Download className={`w-3.5 h-3.5 shrink-0 opacity-60 ${isMe ? "text-white" : "text-zinc-500"}`} />
                                      </a>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Text message content */}
                              {message.text && (
                                <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                                  {message.text}
                                </p>
                              )}
                            </div>

                            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 px-1">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Input Box Footer */}
              <div className="p-4 border-t border-zinc-200/40 dark:border-zinc-800/40 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md relative">
                {/* Images Attachment Preview bar */}
                <AnimatePresence>
                  {attachedImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 flex-wrap pb-3.5"
                    >
                      {attachedImages.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-500/50 shadow-md group"
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeAttachedImage(i)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Files Attachment Preview bar */}
                <AnimatePresence>
                  {attachedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 flex-wrap pb-3.5"
                    >
                      {attachedFiles.map((fileObj, i) => (
                        <div
                          key={i}
                          className="relative flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-xl max-w-xs shadow-sm group"
                        >
                          <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                            {fileObj.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachedFile(i)}
                            className="p-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-rose-500 rounded-full transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Controls */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileAttachmentRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Attachment image selection btn */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-2xl transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                    title="แนบรูปภาพ"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* Attachment file selection btn */}
                  <button
                    type="button"
                    onClick={() => fileAttachmentRef.current?.click()}
                    disabled={isUploading}
                    className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-2xl transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                    title="แนบไฟล์เอกสาร"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                  </button>

                  {/* Input area */}
                  <input
                    type="text"
                    placeholder={
                      isUploading ? "กำลังประมวลผล..." : "พิมพ์ข้อความแชทส่งที่นี่..."
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isUploading}
                    className="flex-1 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isUploading}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-600/20 flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right inner area: Group Info Drawer */}
            <AnimatePresence>
              {isGroupInfoOpen && activeChat.isGroup && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="h-full border-l border-zinc-200/40 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden relative z-10"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white">รายละเอียดกลุ่ม</h3>
                      <p className="text-[10px] font-bold text-zinc-400">สมาชิก {activeChat.participantsDetails?.length || activeChat.participants.length} คน</p>
                    </div>
                    <button
                      onClick={() => setIsGroupInfoOpen(false)}
                      className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Invite/Add Member Button Trigger */}
                  <div className="p-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
                    <button
                      type="button"
                      onClick={() => setIsInviteMemberModalOpen(true)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-blue-500/10"
                    >
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span>เชิญสมาชิกใหม่เข้าร่วมกลุ่ม 👤➕</span>
                    </button>
                  </div>

                  {/* Members List Scroller */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                      รายชื่อสมาชิกกลุ่ม
                    </span>
                    {activeChat.participantsDetails?.map((member) => {
                      if (!member) return null;
                      const isFounder = activeChat.creatorId && member._id === activeChat.creatorId;
                      const isSelf = member._id === currentUserId;
                      const currentUserIsFounder = activeChat.creatorId && currentUserId === activeChat.creatorId;

                      return (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 rounded-xl transition-colors border border-transparent hover:border-zinc-200/20"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 bg-linear-to-tr from-blue-600 to-indigo-500">
                            {member.image ? (
                              <img src={member.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs font-black uppercase">
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate leading-none">
                                {member.name} {isSelf ? "(คุณ)" : ""}
                              </h4>
                              {isFounder && (
                                <span className="text-[7px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1 py-0.5 rounded-sm shrink-0">
                                  ผู้สร้าง
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-zinc-400 truncate mt-0.5 uppercase tracking-wider leading-none">
                              {member.role}
                            </p>
                          </div>

                          {/* Remove member button: ONLY visible to creator (founder), and cannot remove oneself */}
                          {currentUserIsFounder && !isSelf && !isFounder && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberFromGroup(member._id, member.name)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-450 hover:text-red-500 rounded-lg transition-colors shrink-0"
                              title="ลบออกจากกลุ่ม"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Delete Group Section - Creator Only */}
                  {activeChat.creatorId && currentUserId === activeChat.creatorId && (
                    <div className="p-4 border-t border-zinc-200/40 dark:border-zinc-800/40 bg-rose-50/10 dark:bg-rose-950/5 shrink-0">
                      <button
                        type="button"
                        onClick={handleDeleteGroup}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ลบกลุ่มแชทแบบถาวร</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
          ) : (
            /* Splash/Select conversation placeholder */
            <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
              <div className="w-20 h-20 bg-linear-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 animate-pulse">
                <MessageSquare className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  ระบบกล่องข้อความแชท (Inbox Direct Message)
                </h3>
                <p className="text-zinc-500 dark:text-zinc-500 max-w-sm text-xs font-bold leading-relaxed">
                  กรุณาเลือกรายชื่อสมาชิกจากการสนทนาเดิมในแถบซ้ายมือ
                  หรือค้นหารายชื่อใหม่จากช่องค้นหาด้านบน
                  เพื่อเริ่มต้นเชื่อมต่อพูดคุยในระบบได้แบบเรียลไทม์
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with premium blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateGroupModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh] relative"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-indigo-500"></div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> สร้างกลุ่มแชทใหม่
                </h3>
                <button
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                {/* Group Name Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    ชื่อกลุ่มแชท
                  </label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อกลุ่มแชทของคุณ..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
                  />
                </div>

                {/* Selected Members Tag Area */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    สมาชิกกลุ่มที่เลือก ({selectedGroupUsers.length} คน)
                  </label>
                  {selectedGroupUsers.length === 0 ? (
                    <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 italic">
                      ยังไม่ได้เลือกสมาชิกในกลุ่ม
                    </p>
                  ) : (
                    <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto p-1 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                      {selectedGroupUsers.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-150 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black shadow-sm group"
                        >
                          <span>{user.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedGroupUsers((prev) => prev.filter((su) => su._id !== user._id))}
                            className="p-0.5 hover:bg-blue-200/50 dark:hover:bg-blue-800/40 text-blue-500 hover:text-rose-500 rounded-md transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search & Invite Friends */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    ค้นหาและเลือกเชิญเพื่อนร่วมห้องแชท
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="พิมพ์ค้นหารายชื่อเพื่อน..."
                      value={groupUserSearchQuery}
                      onChange={(e) => setGroupUserSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* List of database users (Always visible, scrollable inline) */}
                  <div className="border border-zinc-150 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-50/20 dark:bg-zinc-950/10">
                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-white dark:bg-zinc-900">
                      {groupUserSearchResults.length === 0 ? (
                        <div className="p-6 text-center text-xs font-bold text-zinc-450 dark:text-zinc-500">
                          {groupUserSearchQuery ? "ไม่พบรายชื่อผู้ใช้งาน" : "กำลังโหลดรายชื่อเพื่อน..."}
                        </div>
                      ) : (
                        groupUserSearchResults.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={() => {
                              setSelectedGroupUsers((prev) => [...prev, user]);
                              setGroupUserSearchQuery("");
                            }}
                            className="w-full flex items-center gap-3.5 p-2.5 hover:bg-blue-50/50 dark:hover:bg-zinc-800/80 rounded-xl text-left transition-all group"
                          >
                            <div className="w-8.5 h-8.5 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 bg-linear-to-tr from-blue-600 to-indigo-500">
                              {user.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-[11px] font-black uppercase">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate leading-none">
                                  {user.name}
                                </h4>
                                <span className="text-[7px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1 py-0.5 rounded-sm">
                                  {user.role}
                                </span>
                              </div>
                              {user.department && (
                                <p className="text-[9px] font-bold text-zinc-450 truncate mt-0.5 leading-none">
                                  {user.department}
                                </p>
                              )}
                            </div>
                            <Plus className="w-4 h-4 text-blue-500 shrink-0 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-3 shrink-0 bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-black text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isCreatingGroup || !newGroupName.trim() || selectedGroupUsers.length === 0}
                  onClick={handleCreateGroup}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  {isCreatingGroup ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>สร้างกลุ่มแชท</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {isInviteMemberModalOpen && activeChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with premium blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteMemberModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[80vh] relative"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-indigo-500"></div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" /> เชิญสมาชิกใหม่เข้าร่วมกลุ่ม
                </h3>
                <button
                  onClick={() => setIsInviteMemberModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                {/* Info block */}
                <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3 items-start">
                  <Users className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">
                      กลุ่ม: {activeChat.groupName}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 mt-1 leading-relaxed">
                      เลือกสมาชิกใหม่ด้านล่างเพื่อดึงเข้าร่วมกลุ่มแชททันที ระบบจะคัดกรองเฉพาะผู้ที่ยังไม่ได้เป็นสมาชิกของกลุ่มนี้เท่านั้น
                    </p>
                  </div>
                </div>

                {/* Search input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    ค้นหาเพื่อนร่วมสถาบัน
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="พิมพ์ชื่อเพื่อค้นหารายชื่อเพื่อน..."
                      value={addMemberSearchQuery}
                      onChange={(e) => setAddMemberSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Candidate Selection List (Always visible inline) */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    รายชื่อผู้ใช้ที่ยังไม่ได้รับการเชิญ
                  </label>
                  
                  <div className="border border-zinc-150 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-50/20 dark:bg-zinc-950/10">
                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-white dark:bg-zinc-900">
                      {isAddingMember ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">กำลังดำเนินการ...</p>
                        </div>
                      ) : addMemberSearchResults.length === 0 ? (
                        <div className="p-6 text-center text-xs font-bold text-zinc-450 dark:text-zinc-500">
                          {addMemberSearchQuery ? "ไม่พบรายชื่อผู้ใช้งาน" : "กำลังโหลดรายชื่อเพื่อน..."}
                        </div>
                      ) : (
                        addMemberSearchResults.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onClick={async () => {
                              await handleAddMemberToGroup(user);
                              // Modal remains open so they can invite multiple friends, list will update automatically
                            }}
                            className="w-full flex items-center gap-3.5 p-2.5 hover:bg-blue-50/50 dark:hover:bg-zinc-800/80 rounded-xl text-left transition-all group"
                          >
                            <div className="w-8.5 h-8.5 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 bg-linear-to-tr from-blue-600 to-indigo-500">
                              {user.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-[11px] font-black uppercase">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate leading-none">
                                  {user.name}
                                </h4>
                                <span className="text-[7px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1 py-0.5 rounded-sm">
                                  {user.role}
                                </span>
                              </div>
                              {user.department && (
                                <p className="text-[9px] font-bold text-zinc-450 truncate mt-0.5 leading-none">
                                  {user.department}
                                </p>
                              )}
                            </div>
                            <Plus className="w-4 h-4 text-blue-500 shrink-0 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-150 dark:border-zinc-800 flex justify-end shrink-0 bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsInviteMemberModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-250 dark:hover:bg-zinc-750 text-zinc-700 dark:text-white rounded-xl text-xs font-black transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          กำลังเตรียมระบบแชท...
        </p>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
